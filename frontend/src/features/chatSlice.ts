import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatItem {
  id: string;
  query: string;
  response: string;
  summary: string;
  result_table_path: string;
  result_visualization_path: string;
}

interface ChatState {
  history: ChatItem[];
}

const initialState: ChatState = {
  history: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addResponse: (state, action: PayloadAction<ChatItem>) => {
      state.history.push(action.payload);
    },
  },
});

export const { addResponse } = chatSlice.actions;
export default chatSlice.reducer;