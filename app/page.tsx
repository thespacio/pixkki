// app/page.tsx — Landing pública.
//
// Componente de servidor: lee las campañas de adopción publicadas y se las pasa a la
// landing (que es un componente de cliente). La landing NUNCA llama a la IA: solo
// muestra lo que el personal de un albergue revisó y publicó.
import LandingPage from "@/components/landing/LandingPage";
import { PublishedCampaigns } from "@/components/landing/PublishedCampaigns";
import { getPublishedCampaigns } from "@/modules/campaigns/public";

// La página se regenera como máximo cada 5 minutos (una sola consulta a la base por
// ventana, sin importar cuántas visitas haya). Al publicar o despublicar una campaña
// se invalida al instante con revalidatePath("/"), así que el personal no espera.
export const revalidate = 300;

export default async function Page() {
    const campaigns = await getPublishedCampaigns();

    return <LandingPage campaignsSection={<PublishedCampaigns campaigns={campaigns} />} />;
}
