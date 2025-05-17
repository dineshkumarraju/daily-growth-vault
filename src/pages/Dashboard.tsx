
import { usePreferences } from "@/contexts/PreferencesContext";
import Layout from "@/components/layout/Layout";
import Quote from "@/components/dashboard/Quote";
import HabitList from "@/components/dashboard/HabitList";
import { TabsContent } from "@/components/ui/tabs";
import Analytics from "@/components/dashboard/Analytics";

const Dashboard = () => {
  const { showQuotes } = usePreferences();

  return (
    <Layout>
      <TabsContent value="today" className="space-y-8">
        {showQuotes && <Quote />}
        <HabitList />
      </TabsContent>
      
      <TabsContent value="analytics" className="space-y-8">
        <Analytics />
      </TabsContent>
    </Layout>
  );
};

export default Dashboard;
