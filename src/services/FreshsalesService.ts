import axios from 'axios';

const freshsalesApiKey = import.meta.env.VITE_FRESHSALES_API_KEY;
const freshsalesDomain = import.meta.env.VITE_FRESHSALES_DOMAIN;

export const FreshsalesService = {
  getFields: async () => {
    try {
      return ['cf_ice_breaker', 'cf_pain_points', 'cf_portal_link', 'cf_icp_score', 'cf_holographic_research'];
    } catch (e) {
      console.error(e);
      return ['cf_ice_breaker', 'cf_pain_points'];
    }
  },

  getContacts: async () => {
    const isLive = !!(freshsalesApiKey && freshsalesDomain);
    console.log(`[FreshsalesService] Fetching contacts (Mode: ${isLive ? 'LIVE' : 'MOCK'})`);

    try {
      if (isLive) {
        const response = await axios.get(`https://${freshsalesDomain}.freshsales.io/api/contacts/view/1`, {
          headers: { 'Authorization': `Token token=${freshsalesApiKey}` }
        });
        return response.data.contacts.map((c: any) => ({
          id: c.id.toString(),
          first_name: c.first_name,
          last_name: c.last_name,
          job_title: c.job_title,
          company: c.company?.name || 'Unknown',
          email: c.email
        }));
      }
      
      // Premium Mock Data for testing
      return [
        { id: '101', first_name: 'Jensen', last_name: 'Huang', job_title: 'CEO', company: 'NVIDIA', email: 'jensen@nvidia.com' },
        { id: '102', first_name: 'Lisa', last_name: 'Su', job_title: 'CEO', company: 'AMD', email: 'lisa@amd.com' },
        { id: '103', first_name: 'Satya', last_name: 'Nadella', job_title: 'CEO', company: 'Microsoft', email: 'satya@microsoft.com' }
      ];
    } catch (e) {
      console.error('[FreshsalesService] Fetch Error:', e);
      return [];
    }
  },

  updateContact: async (id: string, data: any) => {
    const isLive = !!(freshsalesApiKey && freshsalesDomain);
    console.log(`[FreshsalesService] Updating contact ${id} (Mode: ${isLive ? 'LIVE' : 'MOCK'})`);

    try {
      if (isLive) {
        await axios.put(`https://${freshsalesDomain}.freshsales.io/api/contacts/${id}`, {
          contact: data
        }, {
          headers: { 'Authorization': `Token token=${freshsalesApiKey}` }
        });
        return { success: true };
      }
      
      console.log(`[MOCK_SYNC_OK] Target ID: ${id}`, data);
      return { success: true };
    } catch (e) {
      console.error('[FreshsalesService] Update Error:', e);
      throw e;
    }
  }
};
