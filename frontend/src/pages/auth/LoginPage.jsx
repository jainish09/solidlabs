import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Box, Lock, Mail, ArrowRight, ShieldCheck, Factory, UserCheck } from 'lucide-react';

export const LoginPage = () => {
  const { setRole, showToast } = useAuth();
  const [email, setEmail] = useState('engineer@solidlabs.demo');
  const [selectedRole, setSelectedRole] = useState('customer');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setRole(selectedRole);
    showToast(`Signed in successfully as ${selectedRole === 'customer' ? 'Hardware Engineer' : 'Manufacturer Partner'}`);
    if (selectedRole === 'customer') {
      navigate('/customer/dashboard');
    } else {
      navigate('/manufacturer/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#F8FAFA]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-xl shadow-teal-600/20 mb-2">
            <span className="font-heading font-black text-2xl text-white">SL</span>
          </div>
          <h2 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
            Sign in to SolidLabs
          </h2>
          <p className="text-xs text-slate-500 font-body">
            Access your AI-assisted engineering workspace & manufacturing orders
          </p>
          <div className="flex justify-center pt-1">
            <Badge variant="teal" size="sm" dot>Frontend Demonstration Mode</Badge>
          </div>
        </div>

        <Card className="bg-white border border-teal-100 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Demo Account Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              required
            />
            <Input
              label="Password (Mock Authentication)"
              type="password"
              value="solidlabs-demo-session"
              readOnly
              leftIcon={<Lock size={16} />}
              helperText="Pre-configured mock credential for evaluation"
            />

            <div className="space-y-2 pt-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold">
                Select Workspace Persona
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('customer');
                    setEmail('lead.engineer@evtechnologies.in');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedRole === 'customer'
                      ? 'border-teal-600 bg-teal-50 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-slate-900">
                    <UserCheck size={16} className={selectedRole === 'customer' ? 'text-teal-700' : 'text-slate-400'} />
                    <span className="text-xs font-bold font-heading">Customer</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono leading-tight">
                    OEM Engineer / CAD Designer
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('manufacturer');
                    setEmail('operations@kalyani-precision.in');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedRole === 'manufacturer'
                      ? 'border-teal-600 bg-teal-50 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-slate-900">
                    <Factory size={16} className={selectedRole === 'manufacturer' ? 'text-teal-700' : 'text-slate-400'} />
                    <span className="text-xs font-bold font-heading">Manufacturer</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono leading-tight">
                    Machine Shop / CNC Partner
                  </p>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold bg-teal-600 hover:bg-teal-700 text-white mt-2 shadow-xs"
              rightIcon={<ArrowRight size={16} />}
            >
              Sign In to Workspace
            </Button>
          </form>
        </Card>

        {/* Security & Credentials Notice */}
        <div className="p-3.5 bg-teal-50/50 rounded-xl border border-teal-100 flex items-start gap-2.5 text-xs font-mono text-slate-600">
          <ShieldCheck size={16} className="text-teal-700 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            All accounts in this demonstration connect to the local in-memory shared state. Changes made in Customer view immediately reflect in Manufacturer view.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
