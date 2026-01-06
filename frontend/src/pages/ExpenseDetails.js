import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { expensesAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';

const ExpenseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: expense, isLoading, refetch } = useQuery({
    queryKey: ['expense', id],
    queryFn: () => expensesAPI.getOne(id).then(res => res.data),
  });

  const handleApprove = async () => {
    try {
      await expensesAPI.approve(id);
      refetch();
      alert('Expense approved');
    } catch (err) {
      alert('Failed to approve expense');
    }
  };

  const handleReject = async () => {
    try {
      await expensesAPI.reject(id);
      refetch();
      alert('Expense rejected');
    } catch (err) {
      alert('Failed to reject expense');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!expense) return <div>Expense not found</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Expense {expense.id}</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/expenses/${id}/edit`)}>Edit</Button>
          <Button onClick={handleApprove}>Approve</Button>
          <Button onClick={handleReject} variant="destructive">Reject</Button>
          <Button variant="ghost" onClick={() => navigate('/expenses')}>Back</Button>
        </div>
      </div>
      <pre className="whitespace-pre-wrap bg-slate-50 p-4 rounded">{JSON.stringify(expense, null, 2)}</pre>
    </div>
  );
};

export default ExpenseDetails;
