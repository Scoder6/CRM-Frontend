import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  ownerId: string;
  createdAt: string;
}

export interface Lead {
  _id: string;
  customerId: string;
  title: string;
  description?: string;
  status: 'New' | 'Contacted' | 'Converted' | 'Lost';
  value: number;
  createdAt: string;
}

export interface CRMContextType {
  customers: Customer[];
  leads: Lead[];
  loading: boolean;
  // Customer methods
  addCustomer: (customer: Omit<Customer, '_id' | 'ownerId' | 'createdAt'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getCustomer: (id: string) => Customer | undefined;
  // Lead methods
  addLead: (lead: Omit<Lead, '_id' | 'createdAt'>) => Promise<void>;
  updateLead: (id: string, lead: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  getCustomerLeads: (customerId: string) => Lead[];
  // Analytics
  getDashboardStats: () => {
    totalCustomers: number;
    totalLeads: number;
    totalValue: number;
    leadsByStatus: Record<string, number>;
    valueByStatus: Record<string, number>;
  };
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

// Mock data
const mockCustomers: Customer[] = [
  {
    _id: '1',
    name: 'Acme Corp',
    email: 'contact@acme.com',
    phone: '+1-555-0123',
    company: 'Acme Corp',
    ownerId: '1',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    _id: '2',
    name: 'TechStart Inc',
    email: 'hello@techstart.com',
    phone: '+1-555-0456',
    company: 'TechStart Inc',
    ownerId: '1',
    createdAt: '2024-01-20T14:20:00Z',
  },
  {
    _id: '3',
    name: 'Global Solutions',
    email: 'info@globalsolutions.com',
    phone: '+1-555-0789',
    company: 'Global Solutions Ltd',
    ownerId: '1',
    createdAt: '2024-02-05T09:15:00Z',
  },
];

const mockLeads: Lead[] = [
  {
    _id: '1',
    customerId: '1',
    title: 'Enterprise Software License',
    description: 'Annual software license for 100 users',
    status: 'Contacted',
    value: 50000,
    createdAt: '2024-01-16T11:00:00Z',
  },
  {
    _id: '2',
    customerId: '1',
    title: 'Consulting Services',
    description: 'Implementation consulting for Q2',
    status: 'New',
    value: 25000,
    createdAt: '2024-01-18T16:30:00Z',
  },
  {
    _id: '3',
    customerId: '2',
    title: 'Cloud Migration',
    description: 'Complete cloud infrastructure migration',
    status: 'Converted',
    value: 75000,
    createdAt: '2024-01-21T13:45:00Z',
  },
  {
    _id: '4',
    customerId: '3',
    title: 'Security Audit',
    description: 'Comprehensive security assessment',
    status: 'Lost',
    value: 15000,
    createdAt: '2024-02-06T10:20:00Z',
  },
];

export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Load mock data - filter by user in real app
      setCustomers(mockCustomers);
      setLeads(mockLeads);
    } else {
      setCustomers([]);
      setLeads([]);
    }
  }, [user]);

  const addCustomer = async (customerData: Omit<Customer, '_id' | 'ownerId' | 'createdAt'>) => {
    if (!user) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newCustomer: Customer = {
        ...customerData,
        _id: String(customers.length + 1),
        ownerId: user._id,
        createdAt: new Date().toISOString(),
      };

      setCustomers(prev => [...prev, newCustomer]);
      toast({
        title: 'Customer added',
        description: `${newCustomer.name} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add customer',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCustomers(prev => prev.map(customer => 
        customer._id === id ? { ...customer, ...customerData } : customer
      ));
      
      toast({
        title: 'Customer updated',
        description: 'Customer information has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update customer',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCustomers(prev => prev.filter(customer => customer._id !== id));
      setLeads(prev => prev.filter(lead => lead.customerId !== id));
      
      toast({
        title: 'Customer deleted',
        description: 'Customer and all associated leads have been deleted.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete customer',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCustomer = (id: string) => {
    return customers.find(customer => customer._id === id);
  };

  const addLead = async (leadData: Omit<Lead, '_id' | 'createdAt'>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newLead: Lead = {
        ...leadData,
        _id: String(leads.length + 1),
        createdAt: new Date().toISOString(),
      };

      setLeads(prev => [...prev, newLead]);
      toast({
        title: 'Lead added',
        description: `${newLead.title} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add lead',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLead = async (id: string, leadData: Partial<Lead>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLeads(prev => prev.map(lead => 
        lead._id === id ? { ...lead, ...leadData } : lead
      ));
      
      toast({
        title: 'Lead updated',
        description: 'Lead has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update lead',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteLead = async (id: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLeads(prev => prev.filter(lead => lead._id !== id));
      
      toast({
        title: 'Lead deleted',
        description: 'Lead has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete lead',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCustomerLeads = (customerId: string) => {
    return leads.filter(lead => lead.customerId === customerId);
  };

  const getDashboardStats = () => {
    const totalCustomers = customers.length;
    const totalLeads = leads.length;
    const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);
    
    const leadsByStatus = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const valueByStatus = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + lead.value;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCustomers,
      totalLeads,
      totalValue,
      leadsByStatus,
      valueByStatus,
    };
  };

  return (
    <CRMContext.Provider value={{
      customers,
      leads,
      loading,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      getCustomer,
      addLead,
      updateLead,
      deleteLead,
      getCustomerLeads,
      getDashboardStats,
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};