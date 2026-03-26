import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CommandPalette } from "./components/ide/CommandPalette";
import { HotkeysModal } from "./components/ide/HotkeysModal";
import { useKeyboardShortcutManager } from "./hooks/useKeyboardShortcutManager";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [hotkeysModalOpen, setHotkeysModalOpen] = useState(false);

  // Initialize keyboard shortcut manager
  useKeyboardShortcutManager();

  useEffect(() => {
    const handleGlobalShortcuts = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }

      if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "f"
      ) {
        event.preventDefault();
        window.dispatchEvent(new Event("ide:open-search"));
      }

      if (event.key === "Escape") {
        setCommandPaletteOpen(false);
        setHotkeysModalOpen(false);
      }
    };

    const handleToggleCommandPalette = () => {
      setCommandPaletteOpen((prev) => !prev);
    };

    window.addEventListener("keydown", handleGlobalShortcuts);
    window.addEventListener(
      "ide:toggle-command-palette",
      handleToggleCommandPalette,
    );

    return () => {
      window.removeEventListener("keydown", handleGlobalShortcuts);
      window.removeEventListener(
        "ide:toggle-command-palette",
        handleToggleCommandPalette,
      );
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <CommandPalette
          open={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
        />
        <HotkeysModal
          open={hotkeysModalOpen}
          onOpenChange={setHotkeysModalOpen}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
