
import Layout from "@/components/layout/Layout";
import Analytics from "@/components/dashboard/Analytics";
import { TabsContent } from "@/components/ui/tabs";
import { usePreferences } from "@/contexts/PreferencesContext";
import Quote from "@/components/dashboard/Quote";

const AnalyticsPage = () => {
  const { showQuotes } = usePreferences();

  return (
    <Layout>
      <TabsContent value="today">
        {/* Empty content for today tab */}
      </TabsContent>
      
      <TabsContent value="analytics" className="space-y-8">
        {showQuotes && <Quote />}
        <Analytics />
      </TabsContent>
    </Layout>
  );
};

export default AnalyticsPage;
