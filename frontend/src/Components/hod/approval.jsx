import React, { useState } from "react";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";

const Approval = () => {
  const [requests, setRequests] = useState([]);

  const fetchApproval = async () => {
    try
        {
        const res = await axios.get("http://localhost:3000/api/approvals");
        setRequests(res.data);
      }
         catch (error) {
        console.error("Error fetching approval requests", error);
      }
    };

    useEffect(() => {
        fetchApproval();
        }, []);

  const handleApprove = (id) => {
    setRequests(
      requests.map((req) =>
        req.id === id ? { ...req, status: "Approved" } : req,
      ),
    );
  };

  const handleReject = (id) => {
    setRequests(
      requests.map((req) =>
        req.id === id ? { ...req, status: "Rejected" } : req,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FileText className="text-teal-500" size={28} />
          Approval Requests
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review and approve faculty requests
        </p>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <span className="text-teal-600 font-semibold text-sm">
                      {request.faculty
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">
                      {request.faculty}
                    </h3>
                    <p className="text-sm text-slate-500">{request.type}</p>
                  </div>
                </div>
                <div className="ml-13 space-y-1">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">Course:</span>{" "}
                    {request.course}
                  </p>
                  <p className="text-xs text-slate-500">
                    Requested on {request.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {request.status === "Pending" ? (
                  <>
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                      request.status === "Approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {request.status === "Approved" ? (
                      <CheckCircle size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                    {request.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Approval;
