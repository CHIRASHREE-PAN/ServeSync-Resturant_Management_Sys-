import CustomerExperiencePanel from '../components/customer/CustomerExperiencePanel';

function CustomerExperiencePage() {
  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-hero border border-border bg-gradient-to-br from-muted via-card to-background p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Guest Services</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">How can we help?</h1>
        <p className="mt-2 max-w-2xl text-sm text-secondary-text">Need assistance during your visit? We're here for you.</p>
      </div>
      <CustomerExperiencePanel />
    </div>
  );
}

export default CustomerExperiencePage;
