import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  FileText,
  PlusCircle,
  Receipt,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';

export const CustomerRequirementsPage = () => {
  const navigate = useNavigate();
  const { requirements, cancelRequirement, quotations } = useAuth();

  const [activeReqDetails, setActiveReqDetails] = useState(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="orange" size="xs" dot>My Active RFQs</Badge>
            <Badge variant="teal" size="xs">Shared Demo State</Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-[#111111] tracking-tight">
            My Posted Manufacturing Requirements
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#858585] font-body">
            Manage your broadcast component RFQs, review received supplier quotes, or edit specifications.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/customize/prod_001')}
          leftIcon={<PlusCircle size={15} />}
        >
          Post New Requirement
        </Button>
      </div>

      {/* Requirements List */}
      <div className="space-y-4">
        {requirements.map((req) => {
          const matchingQuotes = quotations.filter((q) => q.requirementId === req.id);

          return (
            <Card key={req.id} className="p-6 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-mono font-bold text-[#FF7138]">{req.id}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <Badge variant="teal" size="xs">{req.category}</Badge>
                    <Badge
                      variant={
                        req.status === 'in_production'
                          ? 'success'
                          : req.status === 'quoted'
                          ? 'orange'
                          : req.status === 'cancelled'
                          ? 'danger'
                          : 'default'
                      }
                      size="xs"
                    >
                      {req.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold font-heading text-[#111111]">{req.productName}</h3>

                  <div className="flex flex-wrap gap-4 text-xs font-mono text-[#858585] pt-1">
                    <span>Batch: <strong className="text-[#111111]">{req.quantity} pcs</strong></span>
                    <span>Target Budget: <strong className="text-emerald-600">{req.budgetINR}</strong></span>
                    <span>Delivery Location: <strong className="text-[#111111]">{req.deliveryLocation}</strong></span>
                  </div>

                  {req.additionalInstructions && (
                    <p className="text-xs text-[#858585] font-body italic pt-1">
                      "{req.additionalInstructions}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                  {matchingQuotes.length > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/customer/quotes')}
                      leftIcon={<Receipt size={14} />}
                    >
                      View {matchingQuotes.length} Quotes
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveReqDetails(req)}
                  >
                    View Details
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/customer/messages')}
                    leftIcon={<MessageSquare size={13} className="text-[#FF7138]" />}
                    className="hover:border-[#FF7138]"
                  >
                    Chat with Suppliers
                  </Button>

                  {req.status === 'open' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelRequirement(req.id)}
                      className="text-rose-600 hover:bg-rose-50"
                    >
                      Cancel RFQ
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Details Modal */}
      {activeReqDetails && (
        <Modal
          isOpen={!!activeReqDetails}
          onClose={() => setActiveReqDetails(null)}
          title={`RFQ Specification: ${activeReqDetails.id}`}
          description={activeReqDetails.productName}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3.5 bg-[#F5F5F3] rounded-xl space-y-1.5">
              <div className="flex justify-between"><span>Status:</span><span className="font-bold text-[#FF7138]">{activeReqDetails.status.toUpperCase()}</span></div>
              <div className="flex justify-between"><span>Batch Volume:</span><span className="font-bold">{activeReqDetails.quantity} units</span></div>
              <div className="flex justify-between"><span>Target Budget:</span><span className="font-bold text-emerald-600">{activeReqDetails.budgetINR}</span></div>
              <div className="flex justify-between"><span>Process:</span><span>{activeReqDetails.manufacturingProcess}</span></div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase text-[#858585] font-semibold block">Configured Parameters:</span>
              <pre className="p-3 bg-white border border-gray-200 rounded-xl overflow-x-auto text-[11px] text-[#111111]">
                {JSON.stringify(activeReqDetails.customizedSpecs, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" size="sm" onClick={() => setActiveReqDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerRequirementsPage;

