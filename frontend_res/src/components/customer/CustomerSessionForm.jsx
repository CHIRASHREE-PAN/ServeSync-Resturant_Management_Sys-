import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChefHat,
  Clock3,
  Mail,
  Sparkles,
  Table2,
  User as UserIcon,
  Users,
} from "lucide-react";

import {
  createCustomerSession,
  getCustomerSession,
  updateCustomerSession,
} from "../../api/customerSession";

import { useCustomerSession } from "../../context/CustomerSessionContext";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";

function CustomerSessionForm() {
  const { session, saveSession, clearSession } =
    useCustomerSession();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [tableNumber, setTableNumber] = useState(1);

  /*
   * IMPORTANT:
   * Do not trust the session stored in localStorage.
   * Verify it with the backend every time this page loads.
   */
  useEffect(() => {
    let mounted = true;

    const validateStoredSession = async () => {
      if (!session?.id) {
        if (mounted) {
          setName("");
          setEmail("");
          setNumberOfPeople(1);
          setTableNumber(1);
          setCheckingSession(false);
        }
        return;
      }

      try {
        setCheckingSession(true);
        setError("");

        const response = await getCustomerSession(
          session.id
        );

        const backendSession = response.data;

        if (backendSession?.status !== "ACTIVE") {
          clearSession();
          setName("");
          setEmail("");
          setNumberOfPeople(1);
          setTableNumber(1);
          return;
        }

        saveSession(backendSession);

        setName(backendSession.name || "");
        setEmail(backendSession.email || "");
        setNumberOfPeople(
          backendSession.number_of_people || 1
        );
        setTableNumber(
          backendSession.table_number || 1
        );
      } catch (err) {
        clearSession();
        setName("");
        setEmail("");
        setNumberOfPeople(1);
        setTableNumber(1);
        setError("");
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    validateStoredSession();

    return () => {
      mounted = false;
    };
  }, [session?.id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Guest name is required.");
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      setLoading(false);
      return;
    }

    if (Number(numberOfPeople) < 1) {
      setError("At least one guest is required.");
      setLoading(false);
      return;
    }

    if (Number(tableNumber) < 1) {
      setError("Table number is required.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        number_of_people: Number(numberOfPeople),
        table_number: Number(tableNumber),
      };

      let response;

      if (
        session?.id &&
        session?.status === "ACTIVE"
      ) {
        response = await updateCustomerSession(
          session.id,
          payload
        );

        saveSession(response.data);

        setSuccess(
          "Session updated successfully."
        );
      } else {
        response = await createCustomerSession(
          payload
        );

        saveSession(response.data);

        setSuccess(
          "Session created successfully."
        );

        /*
         * Backend returned ACTIVE session and
         * context now holds it. Navigate to the
         * restaurant menu to begin ordering.
         */
        navigate("/menu");
        return;
      }
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to save the customer session right now."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl"
      >
        <Card className="p-6">
          <p className="text-sm text-secondary-text">
            Checking dining session...
          </p>
        </Card>
      </motion.div>
    );
  }

  const hasActiveSession = session?.status === "ACTIVE";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl"
    >
      {/* Welcome / check-in intro */}
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ChefHat size={28} />
        </div>

        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          {hasActiveSession
            ? "Your Table"
            : "Welcome to ServeSync"}
        </p>

        <h2 className="mt-3 text-3xl font-semibold text-text sm:text-4xl">
          {hasActiveSession
            ? "Manage your table"
            : "Let's get your table ready."}
        </h2>

        <p className="mx-auto mt-3 max-w-md text-secondary-text">
          {hasActiveSession
            ? "Update your visit details or head to the menu to keep ordering."
            : "Tell us a little about your visit and we'll get everything ready."}
        </p>
      </div>

      {/* Active session summary */}
      {hasActiveSession && (
        <Card className="mb-6 border-success/20 bg-success/5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">
                Active dining session
              </p>
              <p className="text-sm text-secondary-text">
                Table {session.table_number} is ready for ordering.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Guest name */}
            <div>
              <label
                htmlFor="guest-name"
                className="mb-2 flex items-center gap-1.5 text-sm font-medium text-text"
              >
                <UserIcon size={15} className="text-primary" />
                Guest name
              </label>

              <Input
                id="guest-name"
                placeholder="John Doe"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="guest-email"
                className="mb-2 flex items-center gap-1.5 text-sm font-medium text-text"
              >
                <Mail size={15} className="text-primary" />
                Email
              </label>

              <Input
                id="guest-email"
                type="email"
                placeholder="guest@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />
            </div>

            {/* Number of people */}
            <div>
              <label
                htmlFor="number-of-people"
                className="mb-2 flex items-center gap-1.5 text-sm font-medium text-text"
              >
                <Users size={15} className="text-primary" />
                Number of people
              </label>

              <Input
                id="number-of-people"
                type="number"
                min="1"
                value={numberOfPeople}
                onChange={(event) =>
                  setNumberOfPeople(event.target.value)
                }
              />
            </div>

            {/* Table number */}
            <div>
              <label
                htmlFor="table-number"
                className="mb-2 flex items-center gap-1.5 text-sm font-medium text-text"
              >
                <Table2 size={15} className="text-primary" />
                Table number
              </label>

              <Input
                id="table-number"
                type="number"
                min="1"
                value={tableNumber}
                onChange={(event) =>
                  setTableNumber(event.target.value)
                }
              />
            </div>
          </div>

          {/* Estimated time hint */}
          <div className="rounded-table border border-border bg-muted p-3 text-xs text-secondary-text">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={13} className="text-primary" />
              Your table will be ready as soon as you submit.
            </span>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="h-12 w-full text-base sm:w-auto sm:min-w-44"
          >
            {hasActiveSession
              ? "Update session"
              : "Start Dining"}
          </Button>

          {error && (
            <p className="text-sm text-error">{error}</p>
          )}

          {success && (
            <p className="text-sm text-success">{success}</p>
          )}
        </form>
      </Card>

      {/* Shown only for active sessions — secondary action to menu */}
      {hasActiveSession && (
        <div className="mt-6 text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/menu")}
            className="gap-2"
          >
            <Users size={16} />
            Back to menu
          </Button>
        </div>
      )}
    </motion.div>
  );
}

export default CustomerSessionForm;