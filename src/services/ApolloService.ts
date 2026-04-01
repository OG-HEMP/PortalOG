import axios from 'axios';

const apolloKey = import.meta.env.VITE_APOLLO_API_KEY;

export const ApolloService = {
  testConnection: async () => {
    try {
      // Very basic endpoint to test the key validity (e.g., getting user info or quotas)
      // Since we are NOT pulling leads, we'll just hit the search endpoint with a 0 limit if possible
      // or just return the key status
      if (!apolloKey) throw new Error("No Apollo Key found in .env");
      
      const response = await axios.post('https://api.apollo.io/v1/combined_search', {
        api_key: apolloKey,
        page: 1,
        person_titles: ["CEO"], // Minimal search
        page_size: 0 // Fetch 0 results
      });
      
      if (response.status === 200) {
        return { success: true, message: "Apollo API Connected Successfully" };
      }
      return { success: false, message: `Unexpected Response: ${response.status}` };
    } catch (error: any) {
      console.error("Apollo Test Failure:", error);
      return { success: false, message: error.response?.data?.error || error.message };
    }
  }
};
