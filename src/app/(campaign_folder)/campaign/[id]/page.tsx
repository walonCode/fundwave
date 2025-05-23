"use client"
import { useState, useEffect } from "react"
import type React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Heart,
  Info,
  MessageCircle,
  Share2,
  Users,
  AlertTriangle,
  Target,
  Award,
  Clock,
  ChevronLeft,
  DollarSign,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchCampaigns, selectCampaignById } from "@/core/store/features/campaigns/campaignSlice"
import { useParams } from "next/navigation"
import type { Campaign } from "@/core/types/types"
import { useAppDispatch, useAppSelector } from "@/core/hooks/storeHooks"
import { fetchComment } from "@/core/store/features/comments/commentSlice"
import { selectAllComment } from "@/core/store/features/comments/commentSlice"
import { jwtDecode } from "jwt-decode"
import Cookies from "js-cookie"
import type { User } from "@/core/types/types"
import { fetchUpdate, selectAllUpdate } from "@/core/store/features/update/updateSlice"
import { calculateDaysRemaining } from "@/core/helpers/calculateDayRemaining"
import ShareCard from "@/components/campaign/designSection/shareCard"
import CreatorCard from "@/components/campaign/designSection/creatorCard"
import CommentSection from "@/components/campaign/designSection/commentSection"
import UpdateSection from "@/components/campaign/designSection/updateSection"
import { axiosInstance } from "@/core/api/axiosInstance"

export default function CampaignDetails() {
  const [activeTab, setActiveTab] = useState("about")
  const [commentText, setCommentText] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [donationAmount, setDonationAmount] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const { id } = useParams()
  const dispatch = useAppDispatch()

  const campaign = useAppSelector((state) => selectCampaignById(state, id as string)) as Campaign
  const allComment = useAppSelector(selectAllComment)
  const campaignComment = allComment.filter((comment) => comment.campaignId === (id as string))

  //getting the user from the client cookie
  const token = Cookies.get("userToken")
  const user = token ? (jwtDecode(token) as User) : null

  //geting the update from the server
  const allUpdate = useAppSelector(selectAllUpdate)
  const campaignUpdate = allUpdate.filter((update) => update.campaignId === (id as string))

  //update state
  const isCreator = campaign?.creatorName === user?.username
  const hasUpdates = campaign?.update && campaign?.update?.length > 0

  //update state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isAddingUpdate, setIsAddingUpdate] = useState(false)

  //add update fuunction
  const handleAddUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const data = {
        title,
        description,
        campaignId: id as string,
      }
      const response = await axiosInstance.post(`/campaign/${id}/update`, data)
      if (response.status === 201) {
        setIsAddingUpdate(false)
        await dispatch(fetchUpdate())
        await dispatch(fetchCampaigns())
        setTitle("")
        setDescription("")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Calculate funding progress percentage
  const fundingProgress = campaign?.amountNeeded
    ? Math.min(Math.round(((campaign?.moneyReceived || 0) / campaign?.amountNeeded) * 100), 100)
    : 0

  // Calculate milestone progress percentage
  const milestoneProgress = Math.min(Math.round(((campaign?.moneyReceived || 0) / campaign?.amountNeeded) * 100), 100)

  const daysRemaining = calculateDaysRemaining(campaign?.completionDate as string)

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setIsLoading(true)
    try {
      const data = {
        id,
        description: commentText,
      }
      const response = await axiosInstance.post(`/campaign/${id}/comment`, data)
      if (response.status === 201) {
        await dispatch(fetchComment())
        await dispatch(fetchCampaigns())
        setCommentText("")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle donation submission
  const handleDonation = () => {
    if (!donationAmount || Number.parseFloat(donationAmount) <= 0) return
    // In a real app, you would redirect to payment processing
    alert(`Donation amount: NLe${donationAmount}`)
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-blue-600">Loading campaign details...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-6">
        <div className="container mx-auto px-4 md:px-6">
          <Link
            href="/campaign"
            className="inline-flex items-center text-blue-100 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to all campaigns
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-400/30 text-white hover:bg-blue-400/40 border-blue-400/50">
                  {campaign.category}
                </Badge>
                {daysRemaining > 0 ? (
                  <Badge variant="outline" className="bg-blue-400/20 text-white border-blue-400/50">
                    <Clock className="h-3 w-3 mr-1" /> {daysRemaining} days left
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-400/20 text-white border-yellow-400/50">
                    <Clock className="h-3 w-3 mr-1" /> Campaign ended
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{campaign?.campaignName}</h1>
              <p className="text-blue-100 md:text-lg max-w-2xl">{campaign?.campaignDescription}</p>
            </div>

            <div className="flex items-center gap-3 mt-2 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                className={`border-blue-300 text-black hover:bg-blue-400/20 ${isLiked ? "bg-blue-400/30" : ""}`}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-white" : ""}`} />
                {isLiked ? "Liked" : "Like"}
              </Button>
              <Button variant="outline" size="sm" className="border-blue-300 text-black hover:bg-blue-400/20">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-blue-100">
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2 border border-blue-300">
                <AvatarImage src={`https://avatar.vercel.sh/${campaign?.creatorName}`} alt={campaign?.creatorName} />
                <AvatarFallback className="bg-blue-400 text-white">{campaign?.creatorName?.charAt(0)}</AvatarFallback>
              </Avatar>
              Created by {campaign?.creatorName}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {campaign?.backers} backers
            </div>
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-1" />
              {campaign?.comments?.length || 0} comments
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="overflow-hidden border-blue-100 shadow-sm">
                {/* Campaign Image */}
                <div className="relative">
                  <Image
                    src={campaign.campaignPicture || "/placeholder.svg"}
                    alt={campaign.campaignName}
                    width={800}
                    height={400}
                    className="w-full h-[250px] sm:h-[300px] md:h-[400px] object-cover"
                    priority
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    <div className="text-white">
                      <span className="font-bold text-xl md:text-2xl">
                        NLe{campaign.moneyReceived?.toLocaleString()}
                      </span>
                      <span className="text-sm ml-2 opacity-90">
                        raised of NLe{campaign.amountNeeded?.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white/90 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {fundingProgress}% funded
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="px-6 py-4 border-b border-blue-100">
                  <Progress value={fundingProgress} className="h-2 bg-blue-100" />
                </div>

                {/* Tabs Navigation */}
                <Tabs defaultValue="about" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="px-6 py-4">
                    <TabsList className="grid w-full grid-cols-3 bg-blue-50 rounded-lg">
                      <TabsTrigger
                        value="about"
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm md:text-base py-2 rounded-md"
                      >
                        About
                      </TabsTrigger>
                      <TabsTrigger
                        value="updates"
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm md:text-base py-2 rounded-md"
                      >
                        Updates
                      </TabsTrigger>
                      <TabsTrigger
                        value="comments"
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm md:text-base py-2 rounded-md"
                      >
                        Comments
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* About Tab */}
                  <TabsContent value="about" className="p-6 space-y-8 animate-in fade-in-50">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-blue-800 flex items-center">
                          <Target className="h-5 w-5 mr-2 text-blue-600" />
                          The Problem
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{campaign?.problem}</p>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-blue-800 flex items-center">
                          <Award className="h-5 w-5 mr-2 text-blue-600" />
                          Our Solution
                        </h3>
                        <div className="space-y-3 pl-2 border-l-2 border-blue-100">
                          {campaign?.solution?.map((solution, index) => (
                            <div className="flex gap-3" key={index}>
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <p className="text-gray-700 leading-relaxed">{solution}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-blue-800 flex items-center">
                          <Info className="h-5 w-5 mr-2 text-blue-600" />
                          Expected Impact
                        </h3>
                        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                          <p className="text-gray-700 leading-relaxed">{campaign?.expectedImpact}</p>
                        </div>
                      </div>

                      <Separator className="my-8 bg-blue-100" />

                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-blue-800 flex items-center">
                          <Users className="h-5 w-5 mr-2 text-blue-600" />
                          About the Team
                        </h3>

                        {Array.isArray(campaign?.teamInformation) && campaign?.teamInformation.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {campaign.teamInformation.map((member, index) => (
                              <div
                                key={index}
                                className="bg-white rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all p-4 overflow-hidden group"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-lg font-medium">
                                    {member.name?.charAt(0) || "T"}
                                  </div>
                                  <div className="space-y-2 flex-1">
                                    <div className="flex flex-col">
                                      <h4 className="font-semibold text-blue-800 group-hover:text-blue-600 transition-colors">
                                        {member.name || "Team Member"}
                                      </h4>
                                      <span className="text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full self-start">
                                        {member.qualification || "Team Member"}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                                      {member.experience || "No experience information provided."}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 text-center">
                            <p className="text-blue-700">No team information available</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-blue-800 flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-blue-600" />
                          Risks and Challenges
                        </h3>
                        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                          <p className="text-gray-700 leading-relaxed">{campaign?.risksAndChallenges}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Updates Tab */}
                  <UpdateSection
                    campaignUpdate={campaignUpdate}
                    hasUpdates={hasUpdates as boolean}
                    isCreator={isCreator}
                    isAddingUpdate={isAddingUpdate}
                    setIsAddingUpdate={setIsAddingUpdate}
                    title={title}
                    description={description}
                    setTitle={setTitle}
                    setDescription={setDescription}
                    handleAddUpdate={handleAddUpdate}
                    isLoading={isLoading}
                  />

                  {/* Comments Tab */}
                  <CommentSection
                    campaign={campaign}
                    user={user!}
                    campaignComment={campaignComment}
                    handleCommentSubmit={handleCommentSubmit}
                    commentText={commentText}
                    setCommentText={setCommentText}
                    isLoading={isLoading}
                  />
                </Tabs>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:sticky lg:top-6">
              {/* Donation Card */}
              <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 text-white">
                  <h3 className="text-xl font-semibold">Support This Project</h3>
                  <p className="text-blue-100 text-sm mt-1">
                    Help us reach our goal of NLe{campaign?.amountNeeded?.toLocaleString()}
                  </p>
                </div>

                <CardContent className="space-y-5 pt-5">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-blue-800">
                        NLe{campaign.moneyReceived?.toLocaleString() || "0"}
                      </span>
                      <span className="text-gray-500">of NLe{campaign.amountNeeded?.toLocaleString()}</span>
                    </div>
                    <Progress value={fundingProgress} className="h-3 bg-blue-100" />
                    <div className="flex flex-wrap justify-between text-sm gap-2">
                      <span className="text-blue-700 font-medium">{fundingProgress}% funded</span>
                      <span className="text-blue-700 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {daysRemaining} days left
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label htmlFor="donation-amount" className="block text-sm font-medium text-blue-800 mb-1">
                      Enter donation amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">NLe</span>
                      <Input
                        id="donation-amount"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="0"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        className="pl-10 border-blue-200 focus-visible:ring-blue-400"
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 transition-colors h-12 text-base"
                    onClick={handleDonation}
                    disabled={!donationAmount || Number.parseFloat(donationAmount) <= 0}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Donate Now
                  </Button>

                  <div className="text-xs text-gray-500 pt-1">
                    By donating, you agree to our terms of service and privacy policy.
                  </div>
                </CardContent>
              </Card>

              {/* Current Milestone Card */}
              <Card className="border-blue-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-100 to-blue-50 px-6 py-3 border-b border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-800">Current Milestone</h3>
                </div>
                <CardContent className="space-y-4 pt-4">
                  <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800">
                    {campaign.milestone}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-blue-800">
                        NLe{Math.min(campaign?.moneyReceived || 0, campaign?.amountNeeded).toLocaleString()}
                      </span>
                      <span className="text-gray-500">of NLe{campaign?.amountNeeded.toLocaleString()}</span>
                    </div>
                    <Progress value={milestoneProgress} className="h-2 bg-blue-100" />
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700 font-medium">{milestoneProgress}% complete</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Creator Card */}
              <CreatorCard campaign={campaign} />

              {/* Share Card */}
              <ShareCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
