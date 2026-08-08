import CustomerSessionForm from '../components/customer/CustomerSessionForm';

function CustomerSessionPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Guest Flow</p>
        <h1 className="text-3xl font-semibold text-text">Manage guest sessions</h1>
        <p className="max-w-2xl text-sm text-secondary-text">
          Create, load, or update a dining session before guests place their orders.
        </p>
      </div>
      <CustomerSessionForm />
    </div>
  );
}

export default CustomerSessionPage;
