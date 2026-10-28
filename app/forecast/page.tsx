import PageContainer from "@/components/layout/PageContainer";
import ForecastView from "@/components/forecast/ForecastView";

export const metadata = { title: "Forecast" };

export default function ForecastPage() {
  return (
    <PageContainer>
      <ForecastView />
    </PageContainer>
  );
}
