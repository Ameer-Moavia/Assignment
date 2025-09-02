import { useCompanyStore } from "@/utils/stores/useCompanyStore"; // adjust path
import {api} from "@/utils/Functions/helperApi";

export const refreshCompany = async () => {
  try {
    const companyId = useCompanyStore.getState().company?.id;
    if (!companyId) return;

    const { data } = await api().get(`/company/${companyId}`);
    useCompanyStore.getState().setCompany(data.data); // ✅ use setter from store
  } catch (err) {
    console.error("Failed to refresh company:", err);
  }
};
