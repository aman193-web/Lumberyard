import { createBrowserRouter } from "react-router";
import React from "react";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Onboarding } from "./pages/Onboarding";
import { LumberyardSetup } from "./pages/lumberyard/LumberyardSetup";
import { AppLayout } from "./components/layout/AppLayout";

// Contractor Pages
import { ContractorDashboard } from "./pages/contractor/ContractorDashboard";
import { ContractorProjects } from "./pages/contractor/ContractorProjects";
import { NewProject } from "./pages/contractor/NewProject";
import { BlueprintUpload } from "./pages/contractor/BlueprintUpload";
import { TakeoffResults } from "./pages/contractor/TakeoffResults";
import { Marketplace } from "./pages/contractor/Marketplace";
import { Checkout } from "./pages/contractor/Checkout";
import { ResponsibilityGate } from "./pages/contractor/ResponsibilityGate";
import { PreFlightCheck } from "./pages/contractor/PreFlightCheck";
import { DeliveryCalendar } from "./pages/contractor/DeliveryCalendar";
import { DeliveryTracking } from "./pages/contractor/DeliveryTracking";
import { ContractorDeliveries } from "./pages/contractor/ContractorDeliveries";
import { ReviewSubmission } from "./pages/contractor/ReviewSubmission";
import { CaseFile } from "./pages/contractor/CaseFile";
import { ContractorAnalytics } from "./pages/contractor/ContractorAnalytics";
import { SupplierComms } from "./pages/contractor/SupplierComms";

// Lumberyard Pages
import { LumberyardDashboard } from "./pages/lumberyard/LumberyardDashboard";
import { LumberyardOrders } from "./pages/lumberyard/LumberyardOrders";
import { ProductCatalog } from "./pages/lumberyard/ProductCatalog";
import { CapacityManagement } from "./pages/lumberyard/CapacityManagement";
import { LumberyardAnalytics } from "./pages/lumberyard/LumberyardAnalytics";
import { LumberyardQuotations } from "./pages/lumberyard/LumberyardQuotations";
import { LumberyardConfiguration } from "./pages/lumberyard/LumberyardConfiguration";
import { LumberyardOnboarding } from "./pages/lumberyard/LumberyardOnboarding";
import { SupplierTerms } from "./pages/lumberyard/SupplierTerms";
import { SupplierProfile } from "./pages/lumberyard/SupplierProfile";
import { TeamPermissions } from "./pages/lumberyard/TeamPermissions";
import { LumberyardReviews } from "./pages/lumberyard/LumberyardReviews";
import { MarketplaceReadiness } from "./pages/lumberyard/MarketplaceReadiness";

// Architect Pages
import { ArchitectDashboard } from "./pages/architect/ArchitectDashboard";
import { TakeoffReview } from "./pages/architect/TakeoffReview";

// Homeowner Pages
import { HomeownerDashboard } from "./pages/homeowner/HomeownerDashboard";

// Shared
import { SettingsPage } from "./pages/shared/SettingsPage";
import { MessagesPage } from "./pages/shared/MessagesPage";

// Layout wrappers for each role
const ContractorLayout = () => React.createElement(AppLayout, { role: "contractor" });
const LumberyardLayout = () => React.createElement(AppLayout, { role: "lumberyard" });
const ArchitectLayout = () => React.createElement(AppLayout, { role: "architect" });
const HomeownerLayout = () => React.createElement(AppLayout, { role: "homeowner" });

const ContractorSettings = () => React.createElement(SettingsPage, { role: "contractor" });
const LumberyardSettings = () => React.createElement(SettingsPage, { role: "lumberyard" });
const ArchitectSettings = () => React.createElement(SettingsPage, { role: "architect" });
const HomeownerSettings = () => React.createElement(SettingsPage, { role: "homeowner" });

// Messages wrappers — role-aware
const ContractorMessages = () => React.createElement(MessagesPage, { role: "contractor" });
const LumberyardMessages = () => React.createElement(MessagesPage, { role: "lumberyard" });
const ArchitectMessages = () => React.createElement(MessagesPage, { role: "architect" });
const HomeownerMessages = () => React.createElement(MessagesPage, { role: "homeowner" });

export const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/login", Component: Login },
  { path: "/onboarding", Component: Onboarding },
  { path: "/lumberyard-setup", Component: LumberyardSetup },

  // Contractor Routes
  {
    path: "/contractor",
    Component: ContractorLayout,
    children: [
      { index: true, Component: ContractorDashboard },
      { path: "projects", Component: ContractorProjects },
      { path: "projects/new", Component: NewProject },
      { path: "projects/:id/upload", Component: BlueprintUpload },
      { path: "projects/:id/takeoff", Component: TakeoffResults },
      { path: "marketplace", Component: Marketplace },
      { path: "marketplace/:id", Component: Marketplace },
      { path: "checkout", Component: Checkout },
      { path: "responsibility", Component: ResponsibilityGate },
      { path: "preflight", Component: PreFlightCheck },
      { path: "deliveries", Component: ContractorDeliveries },
      { path: "deliveries/calendar", Component: DeliveryCalendar },
      { path: "tracking", Component: DeliveryTracking },
      { path: "comms", Component: SupplierComms },
      { path: "review/:id", Component: ReviewSubmission },
      { path: "review", Component: ReviewSubmission },
      { path: "casefile", Component: CaseFile },
      { path: "analytics", Component: ContractorAnalytics },
      { path: "messages", Component: ContractorMessages },
      { path: "settings", Component: ContractorSettings },
    ],
  },

  // Lumberyard Routes
  {
    path: "/lumberyard",
    Component: LumberyardLayout,
    children: [
      { index: true, Component: LumberyardDashboard },
      { path: "orders", Component: LumberyardOrders },
      { path: "quotations", Component: LumberyardQuotations },
      { path: "catalog", Component: ProductCatalog },
      { path: "capacity", Component: CapacityManagement },
      { path: "analytics", Component: LumberyardAnalytics },
      { path: "configuration", Component: LumberyardConfiguration },
      { path: "onboarding", Component: LumberyardOnboarding },
      { path: "terms", Component: SupplierTerms },
      { path: "profile", Component: SupplierProfile },
      { path: "team", Component: TeamPermissions },
      { path: "reviews", Component: LumberyardReviews },
      { path: "readiness", Component: MarketplaceReadiness },
      { path: "messages", Component: LumberyardMessages },
      { path: "settings", Component: LumberyardSettings },
    ],
  },

  // Architect Routes
  {
    path: "/architect",
    Component: ArchitectLayout,
    children: [
      { index: true, Component: ArchitectDashboard },
      { path: "reviews", Component: TakeoffReview },
      { path: "reviews/:id", Component: TakeoffReview },
      { path: "projects", Component: ArchitectDashboard },
      { path: "messages", Component: ArchitectMessages },
      { path: "profile", Component: ArchitectSettings },
      { path: "settings", Component: ArchitectSettings },
    ],
  },

  // Homeowner Routes
  {
    path: "/homeowner",
    Component: HomeownerLayout,
    children: [
      { index: true, Component: HomeownerDashboard },
      { path: "project", Component: HomeownerDashboard },
      { path: "materials", Component: Marketplace },
      { path: "deliveries", Component: DeliveryCalendar },
      { path: "messages", Component: HomeownerMessages },
      { path: "settings", Component: HomeownerSettings },
    ],
  },
]);