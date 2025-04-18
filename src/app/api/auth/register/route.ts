import User from "@/core/models/userModel";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/core/validators/user.schema";
import { apiResponse } from "@/core/helpers/apiResponse";
import { errorHandler } from "@/core/helpers/errorHandler";
import { ConnectDB } from "@/core/configs/mongoDB";
import { generateVerificationToken } from "@/core/helpers/jwtHelpers";
import { sendVerificationEmail } from "@/core/configs/nodemailer";

export async function POST(req: NextRequest) {
  try {
    // Database connection
    await ConnectDB();

    const formData = await req.formData();
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const role = formData.get("role") as string;

    const reqBody = {
      firstName,
      lastName,
      username,
      email,
      password,
    };

    const result = registerSchema.safeParse(reqBody);
    if (!result.success) {
      return errorHandler(400, result.error.issues[0].message, result.error);
    }

    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return errorHandler(400, "User already exists", null);
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    let newUser;
    if (role) { 
      newUser = new User({
        firstName,
        lastName,
        username,
        email,
        password: passwordHash,
        roles: role,
        isVerified:false
      });
    } else {
      newUser = new User({
        firstName,
        lastName,
        username,
        email,
        password: passwordHash,
        roles: "User", // Default role
        isVerified:false
      });
    }

    await newUser.save();

    const token = generateVerificationToken(newUser._id as string)
    let verifyUrl;

    if(process.env.NODE_ENV === "development"){
      verifyUrl = `http://localhost:3000/api/auth/verify?token=${token}`
    }else {
      verifyUrl = `https://fundwavesl.vercel.app/api/auth/verify?token=${token}`
    }
    

    try{
      await sendVerificationEmail(email, verifyUrl, username)

      newUser.emailSent = true;
      await newUser.save();
    }catch(error){
      console.error("Failed to send verification email: ",error)
    }
    
    
    return apiResponse("User created successfully", 201, undefined);
  } catch (error) {
    return errorHandler(500, "Internal server error", error);
  }
}