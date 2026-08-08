import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

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
   *
   * Verify it with the backend every time this page loads.
   */
  useEffect(() => {
    let mounted = true;

    const validateStoredSession = async () => {
      /*
       * No stored session.
       * Start with a completely empty customer form.
       */
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

        /*
         * Ask the backend for the real current session.
         */
        const response = await getCustomerSession(
          session.id
        );

        const backendSession = response.data;

        /*
         * Only ACTIVE sessions are allowed to remain
         * in localStorage/frontend state.
         */
        if (
          backendSession?.status !== "ACTIVE"
        ) {
          clearSession();

          setName("");
          setEmail("");
          setNumberOfPeople(1);
          setTableNumber(1);

          return;
        }

        /*
         * Backend confirms that the session is ACTIVE.
         * Save the latest backend version.
         */
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
        /*
         * The session may have been completed/deleted
         * in the database while old data still exists
         * in localStorage.
         *
         * Clear the stale localStorage session.
         */
        clearSession();

        setName("");
        setEmail("");
        setNumberOfPeople(1);
        setTableNumber(1);

        /*
         * Don't show a scary error for an old/stale session.
         * Just start a fresh session.
         */
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

      /*
       * Only update if we have a session that has
       * already been verified as ACTIVE.
       */
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
        /*
         * No valid ACTIVE session:
         * create a completely new one.
         */
        response = await createCustomerSession(
          payload
        );

        saveSession(response.data);

        setSuccess(
          "Session created successfully."
        );
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

  /*
   * While checking an old localStorage session,
   * don't show "Manage your dining session".
   */
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

  const hasActiveSession =
    session?.status === "ACTIVE";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl"
    >
      <Card className="p-6">
        <div>
          <p className="text-sm font-medium text-primary">
            Customer Session
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-text">
            {hasActiveSession
              ? "Manage your dining session"
              : "Start your dining session"}
          </h2>

          <p className="mt-2 text-sm text-secondary-text">
            Enter your details to start ordering.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {/* Guest name */}
            <div>
              <label
                htmlFor="guest-name"
                className="mb-2 block text-sm font-medium text-text"
              >
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
                className="mb-2 block text-sm font-medium text-text"
              >
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
                className="mb-2 block text-sm font-medium text-text"
              >
                Number of people
              </label>

              <Input
                id="number-of-people"
                type="number"
                min="1"
                value={numberOfPeople}
                onChange={(event) =>
                  setNumberOfPeople(
                    event.target.value
                  )
                }
              />
            </div>

            {/* Table number */}
            <div>
              <label
                htmlFor="table-number"
                className="mb-2 block text-sm font-medium text-text"
              >
                Table number
              </label>

              <Input
                id="table-number"
                type="number"
                min="1"
                value={tableNumber}
                onChange={(event) =>
                  setTableNumber(
                    event.target.value
                  )
                }
              />
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full sm:w-auto"
          >
            {hasActiveSession
              ? "Update session"
              : "Start dining"}
          </Button>

          {error && (
            <p className="text-sm text-error">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-success">
              {success}
            </p>
          )}

          {/* Active session information */}
          {hasActiveSession && (
            <div className="rounded-2xl border border-border bg-muted p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-text">
                <Users
                  size={16}
                  className="text-primary"
                />

                Active dining session
              </div>

              <p className="mt-2 text-sm text-secondary-text">
                Table {session.table_number} is
                ready for ordering.
              </p>
            </div>
          )}
        </form>
      </Card>
    </motion.div>
  );
}

export default CustomerSessionForm;