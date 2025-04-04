import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import { axiosInstance } from "@/core/api/axiosInstance";
import { CampaignSice } from "@/core/types/slicesTypes";
import { Campaign } from "@/core/types/types";
import { RootState } from "../../store";


const campaignAdaptor = createEntityAdapter<Campaign, string>({
    selectId: (campaign) => campaign._id as string,
    sortComparer:(a,b) => (b._id ?? "").localeCompare(a._id ?? "")
})

export const fetchCampaigns = createAsyncThunk("campaign/fetchCampaigns", async(_,{rejectWithValue}) => {
    try{
        const response = await axiosInstance.get('/campaign')
        return response.data.data as Campaign[] || []
    }catch(error){
        console.error(error)
        return rejectWithValue("Failed to fetch campaign");
    }
})


export const deleteCampaign = createAsyncThunk("campaign/deleteCampaign", async(id:string, {rejectWithValue}) => {
    try{
        const response = await axiosInstance.delete(`campaign/${id}`)
        return response.data.data as {id : string}
    }catch(error){
        console.error(error)
        return rejectWithValue("Deleting campaign failed")
    }
})

const initialState:CampaignSice = campaignAdaptor.getInitialState({
    status:"idle",
    error:null
})

const campaignSlice = createSlice({
    name:"campaign",
    initialState,
    reducers:{},
    extraReducers(builder){
        builder.addCase(fetchCampaigns.pending, (state) => {
            state.status = "loading";
            state.error = null;
        })
        .addCase(fetchCampaigns.fulfilled, (state, action) => {
            state.status = "success";
            campaignAdaptor.upsertMany(state, action.payload);
            state.error = null;
        })
        .addCase(fetchCampaigns.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.error.message as string;
        })
        .addCase(deleteCampaign.pending, (state) => {
            state.status = "loading";
            state.error = null
        })
        .addCase(deleteCampaign.fulfilled, (state, action) => {
            state.status = "success";
            campaignAdaptor.removeOne(state, action.payload.id ?? "")
        })
        .addCase(deleteCampaign.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.payload as string;
        })
    }
})

export const {
    selectAll:selectAllCampaign,
    selectById:selectCampaignById,
    selectIds: getCampaignId,
} = campaignAdaptor.getSelectors((state:RootState) => state.campaign)

export default campaignSlice.reducer