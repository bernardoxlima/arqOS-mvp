import { motion } from "framer-motion";
import { FloorPlanLayout } from "@/components/FloorPlanLayout";
import { ComplementaryItems } from "@/components/ComplementaryItems";
import { FloorPlanItem, FloorPlanLayoutData, ComplementaryItemsData } from "@/types/presentation";
import { StoredPresentationData } from "@/hooks/usePresentationStorage";

interface TabLayoutProps {
  data: StoredPresentationData;
  setFloorPlanLayout: (layout: FloorPlanLayoutData) => void;
  setComplementaryItems: (items: ComplementaryItemsData) => void;
}

export function TabLayout({
  data,
  setFloorPlanLayout,
  setComplementaryItems,
}: TabLayoutProps) {
  const handleLayoutChange = (layoutData: { originalImage: string | null; items: FloorPlanItem[] }) => {
    setFloorPlanLayout(layoutData);
  };

  const handleComplementaryChange = (items: FloorPlanItem[]) => {
    setComplementaryItems({ items });
  };

  // Get the highest number from layout items to continue numbering
  const getStartingNumber = () => {
    const layoutItems = data.floorPlanLayout.items || [];
    if (layoutItems.length === 0) return 1;
    return Math.max(...layoutItems.map(item => item.number)) + 1;
  };

  const totalItems = data.floorPlanLayout.items.length + data.complementaryItems.items.length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between bg-card border border-border p-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-foreground">Layout de Projeto</h2>
          <p className="text-sm text-muted-foreground">
            Configure a planta baixa e adicione itens complementares
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-foreground">
              {data.floorPlanLayout.items.length}
            </div>
            <div className="text-xs text-muted-foreground">Itens na Planta</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-foreground">
              {data.complementaryItems.items.length}
            </div>
            <div className="text-xs text-muted-foreground">Complementares</div>
          </div>
          <div className="text-center border-l border-border pl-4">
            <div className="text-2xl font-bold text-primary">
              {totalItems}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </motion.div>

      {/* Floor Plan Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FloorPlanLayout
          items={data.floorPlanLayout.items}
          originalImage={data.floorPlanLayout.originalImage}
          onDataChange={handleLayoutChange}
        />
      </motion.div>

      {/* Complementary Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ComplementaryItems
          items={data.complementaryItems.items}
          onDataChange={handleComplementaryChange}
          startingNumber={getStartingNumber()}
        />
      </motion.div>
    </div>
  );
}
