import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

import AdminDashboard from "../components/admin/AdminDashboard";
import AdminSections from "../components/admin/AdminSections";
import ReportsPanel from "../components/admin/ReportsPanel";

function AdminPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <ShieldCheck
            size={22}
            className="text-primary"
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-text">
            Admin Console
          </h1>

          <p className="text-sm text-secondary-text">
            Business overview and operational control
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-muted p-5">
        <p className="text-sm text-secondary-text">
          Track revenue, guest feedback, staff activity,
          menu records, and daily operations from a single
          command center.
        </p>
      </div>

      <AdminDashboard />

      <ReportsPanel />

      <AdminSections />
    </motion.div>
  );
}

export default AdminPage;