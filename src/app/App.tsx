import { RouterProvider } from "react-router";
import { router } from "./routes";
import { QuoteProvider } from "./context/QuoteContext";
import { SupplierSetupProvider } from "./context/SupplierSetupContext";

export default function App() {
  return (
    <QuoteProvider>
      <SupplierSetupProvider>
        <RouterProvider router={router} />
      </SupplierSetupProvider>
    </QuoteProvider>
  );
}