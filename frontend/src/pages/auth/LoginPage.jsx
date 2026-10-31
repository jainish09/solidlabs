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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#F5F5F3]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#111111] text-white shadow-xl shadow-black/10 border border-gray-800 mb-2">
            <span className="font-heading font-black text-2xl text-[#FF7138]">SL</span>
          </div>
          <h2 className="text-2xl font-black font-heading text-[#111111] tracking-tight">
            Sign in to SolidLabs
          </h2>
          <p className="text-xs text-[#858585] font-body">
            Access your AI-assisted engineering workspace & manufacturing orders
          </p>
          <div className="flex justify-center pt-1">
            <Badge variant="teal" size="sm" dot>Frontend Demonstration Mode</Badge>
          </div>
        </div>

        <Card>
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
              <label className="block text-xs font-mono uppercase tracking-wider text-[#858585] font-semibold">
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
                      ? 'border-[#FF7138] bg-[#FF7138]/5 shadow-sm'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[#111111]">
                    <UserCheck size={16} className={selectedRole === 'customer' ? 'text-[#FF7138]' : 'text-gray-400'} />
                    <span className="text-xs font-bold font-heading">Customer</span>
                  </div>
                  <p className="text-[10px] text-[#858585] font-mono leading-tight">
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
                      ? 'border-[#20B8A5] bg-[#20B8A5]/5 shadow-sm'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[#111111]">
                    <Factory size={16} className={selectedRole === 'manufacturer' ? 'text-[#20B8A5]' : 'text-gray-400'} />
                    <span className="text-xs font-bold font-heading">Manufacturer</span>
                  </div>
                  <p className="text-[10px] text-[#858585] font-mono leading-tight">
                    CNC Plant / Foundry Partner
                  </p>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-3"
              rightIcon={<ArrowRight size={16} />}
            >
              Enter {selectedRole === 'customer' ? 'Hardware Engineer' : 'Manufacturer'} Portal
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-mono text-[#858585]">
            <span className="flex items-center gap-1 text-[#20B8A5]">
              <ShieldCheck size={13} />
              Session Local Mock State
            </span>
            <span>No backend credentials required</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
