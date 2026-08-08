import Card from '../../components/ui/Card';

function NetworkErrorPage() {
  return (
    <Card className="mx-auto max-w-lg text-center">
      <h2 className="text-2xl font-semibold text-text">Network issue</h2>
      <p className="mt-2 text-secondary-text">Please retry when the connection is available.</p>
    </Card>
  );
}

export default NetworkErrorPage;
