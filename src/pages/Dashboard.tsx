import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { differenceInDays } from 'date-fns';
import { useState } from "react";
import { SummaryMetrics } from "@/components/dashboard/SummaryMetrics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COMPANY_ID = "Core Financial Management";
const SAMPLE_COMPANY_ID = "Eagle Financial Solutions";

// Sample data for demonstration
const sampleUpcomingEvents = [
  {
    eventId: "Latrobe Library 12/3-12/5",
    registrants: 45,
    firstEventDate: "2024-12-03",
    invoiceStatus: "Paid",
    venue: "Latrobe Public Library",
    address: "1234 Library Way, Latrobe, PA",
  },
  {
    eventId: "Downtown Center 12/10",
    registrants: 32,
    firstEventDate: "2024-12-10",
    invoiceStatus: "Pending",
    venue: "Downtown Business Center",
    address: "567 Main Street, Suite 200",
  },
  {
    eventId: "Community Hall 12/15",
    registrants: 28,
    firstEventDate: "2024-12-15",
    invoiceStatus: "Unpaid",
    venue: "Westview Community Hall",
    address: "890 Park Avenue",
  },
];

const sampleMailingPerformance = [
  { month: 'October', attendees: 120 },
  { month: 'November', attendees: 150 },
  { month: 'December', attendees: 180 },
];

const sampleUnreadMessages = [
  {
    id: 1,
    sender: "John Smith",
    subject: "Event Registration Question",
    preview: "I wanted to ask about the upcoming...",
    time: "10:30 AM",
  },
  {
    id: 2,
    sender: "Sarah Johnson",
    subject: "Venue Change Request",
    preview: "Is it possible to modify the venue...",
    time: "9:15 AM",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [showSampleData, setShowSampleData] = useState(false);

  const { data: advisorData } = useQuery({
    queryKey: ['advisorData', COMPANY_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisor_data')
        .select('*')
        .eq('company_id', COMPANY_ID);
      if (error) throw error;
      return data;
    }
  });

  const { data: registrantData } = useQuery({
    queryKey: ['registrantData', COMPANY_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrant_data')
        .select('*')
        .eq('Company ID', COMPANY_ID)
        .order('Created', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    }
  });

  // Restore the eventData query
  const { data: eventData } = useQuery({
    queryKey: ['eventData', COMPANY_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisor_events')
        .select('*')
        .eq('company_id', COMPANY_ID);
      if (error) throw error;
      return data;
    }
  });

  // New query for sample registrant data
  const { data: sampleRegistrantData } = useQuery({
    queryKey: ['sampleRegistrantData', SAMPLE_COMPANY_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrant_data')
        .select('*')
        .eq('Company ID', SAMPLE_COMPANY_ID)
        .order('Created', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    }
  });

  const calculateDaysUntilNextEvent = () => {
    if (!eventData || eventData.length === 0) return 0;
    const upcomingEvents = eventData
      .filter(event => event["First Event Date"])
      .sort((a, b) => new Date(a["First Event Date"]).getTime() - new Date(b["First Event Date"]).getTime());
    if (upcomingEvents.length === 0) return 0;
    return differenceInDays(new Date(upcomingEvents[0]["First Event Date"]), new Date());
  };

  const countUpcomingEvents = () => {
    if (!eventData) return 0;
    const today = new Date();
    return eventData.filter(event => {
      const eventDate = new Date(event["First Event Date"]);
      return eventDate > today;
    }).length;
  };

  const countInvoicesDue = () => {
    return 3; // This would normally be calculated based on actual invoice data
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
                    <p className="text-sm text-gray-500">{COMPANY_ID}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSampleData(!showSampleData)}
                  >
                    {showSampleData ? "Show Real Data" : "Show Sample Data"}
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SummaryMetrics
              showSampleData={showSampleData}
              upcomingEvents={countUpcomingEvents()}
              totalRegistrants={registrantData?.length || 0}
              daysUntilNextEvent={calculateDaysUntilNextEvent()}
              invoicesDue={countInvoicesDue()}
            />

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Next 3 scheduled events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(showSampleData ? sampleUpcomingEvents : eventData?.slice(0, 3))?.map((event) => (
                    <div key={event.eventId || event["Event ID"]} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                      <div className="flex-1">
                        <h3 className="font-medium">{event.eventId || event["Event ID"]}</h3>
                        <p className="text-sm text-gray-500">
                          {showSampleData ? `${event.registrants} registrants` : "No registrants yet"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {showSampleData 
                              ? differenceInDays(new Date(event.firstEventDate), new Date())
                              : differenceInDays(new Date(event["First Event Date"]), new Date())} days
                          </p>
                          <p className="text-xs text-gray-500">Until event</p>
                        </div>
                        {showSampleData && (
                          <Badge className={`${getInvoiceStatusColor(event.invoiceStatus)}`}>
                            {event.invoiceStatus}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Events
                </Button>
              </CardContent>
            </Card>

            {/* Mailing Performance */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Mailing Performance</CardTitle>
                <CardDescription>Attendees per event over the last 3 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={showSampleData ? sampleMailingPerformance : []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="attendees" fill="#1a365d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Unread Messages */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Unread Messages</CardTitle>
                <CardDescription>Recent communications requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                {showSampleData && (
                  <div className="space-y-4">
                    {sampleUnreadMessages.map((message) => (
                      <div key={message.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                        <div className="flex-1">
                          <h3 className="font-medium">{message.subject}</h3>
                          <p className="text-sm text-gray-500">{message.sender}</p>
                          <p className="text-sm text-gray-500">{message.preview}</p>
                        </div>
                        <div className="text-sm text-gray-500">{message.time}</div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      View All Messages
                    </Button>
                  </div>
                )}
                {!showSampleData && (
                  <div className="text-center py-8 text-gray-500">
                    No unread messages
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Registrants Table */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>New Registrants</CardTitle>
                <CardDescription>Latest registrations for {showSampleData ? SAMPLE_COMPANY_ID : COMPANY_ID}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Registration Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(showSampleData ? sampleRegistrantData : registrantData)?.map((registrant) => (
                      <TableRow key={registrant["Registrant ID"]}>
                        <TableCell className="font-medium">
                          {registrant["First Name"]} {registrant["Last Name"]}
                        </TableCell>
                        <TableCell>{registrant["Email"]}</TableCell>
                        <TableCell>{registrant["Phone"]}</TableCell>
                        <TableCell>{new Date(registrant["Created"]).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Recent Events Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Latest scheduled events for {COMPANY_ID}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event ID</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Mailing Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventData?.slice(0, 5).map((event) => (
                      <TableRow key={event["Event ID"]}>
                        <TableCell className="font-medium">{event["Event ID"]}</TableCell>
                        <TableCell>{event["Venue Name"]}</TableCell>
                        <TableCell>{event["First Event Date"]}</TableCell>
                        <TableCell>{event["Mailing Quantity"]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
