import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfirmDialogProvider } from "@/components/confirm-dialog-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Knowledge from "./pages/Knowledge";
import EquipmentDetail from "./pages/EquipmentDetail";
import Prompt from "./pages/Prompt";
import Library from "./pages/Library";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import { AppLayout } from "./components/AppLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { PassportProvider } from "./contexts/PassportContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <ConfirmDialogProvider>
        <BrowserRouter>
          <AuthProvider>
            <PassportProvider>
              <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Prompt />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/knowledge"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Knowledge />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/knowledge/:equipmentId"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <EquipmentDetail />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/library"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Library />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Profile />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PassportProvider>
          </AuthProvider>
        </BrowserRouter>
      </ConfirmDialogProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
