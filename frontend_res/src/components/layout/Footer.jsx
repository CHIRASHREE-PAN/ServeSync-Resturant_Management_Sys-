import { memo } from "react";

const Footer = memo(function Footer() {
  return (
    <footer className="border-t border-border bg-card px-4 py-4 text-sm text-secondary-text sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 ServeSync. All rights reserved.</p>

        <div className="flex flex-wrap gap-4">
          <span>ServeSync Platform</span>
          <span>v1.0</span>
          <span>Secure OTP Access</span>
        </div>
      </div>
    </footer>
  );
});

export default Footer;