'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, ChevronRight } from 'lucide-react';
import { adminApi, type UserQueryParams } from '../../../services/admin.service';
import type { User, PaginationMeta } from '../../../types';
import { Navbar } from '../../../components/layout/Navbar';
import { Table, type Column } from '../../../components/ui/Table';
import { Pagination } from '../../../components/ui/Pagination';
import { SearchBar } from '../../../components/ui/SearchBar';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { ErrorState } from '../../../components/ui/ErrorState';
import { roleBadgeColor, roleLabel } from '../../../lib/utils';
import { ROUTES } from '../../../lib/constants';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: UserQueryParams = {
        page,
        limit: 10,
        sortBy,
        sortOrder,
      };
      if (search) params.search = search;
      if (role) params.role = role as any;

      const result = await adminApi.getUsers(params);
      setUsers(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, role, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      else fetchUsers();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
    setPage(1);
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (row) => <span className="font-medium text-gray-900">{row.name}</span>,
    },
    { key: 'email', header: 'Email', sortable: true },
    {
      key: 'address',
      header: 'Address',
      render: (row) => (
        <span className="text-gray-500">{row.address || '—'}</span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (row) => (
        <Badge color={roleBadgeColor(row.role)}>{roleLabel(row.role)}</Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      render: () => (
        <span className="flex justify-end">
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </span>
      ),
    },
  ];

  return (
    <>
      <Navbar
        title="User Management"
        subtitle="View and manage all users"
        actions={
          <Button onClick={() => router.push(ROUTES.ADMIN_ADD_USER)} className="hidden sm:flex">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        }
      />

      <div className="space-y-4">
        {/* Mobile add button */}
        <Button onClick={() => router.push(ROUTES.ADMIN_ADD_USER)} fullWidth className="sm:hidden">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, or address..."
          />
          <div className="sm:w-48">
            <Select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              placeholder="All Roles"
              options={[
                { value: '', label: 'All Roles' },
                { value: 'NORMAL_USER', label: 'Normal User' },
                { value: 'SYSTEM_ADMIN', label: 'System Admin' },
                { value: 'STORE_OWNER', label: 'Store Owner' },
              ]}
            />
          </div>
        </div>

        {/* Table */}
        {error ? (
          <ErrorState message={error} onRetry={fetchUsers} />
        ) : (
          <>
            <Table
              columns={columns}
              data={users}
              loading={loading}
              emptyMessage="No users found"
              onSort={handleSort}
              sortKey={sortBy}
              sortOrder={sortOrder}
              onRowClick={(row) => router.push(ROUTES.ADMIN_USER_DETAIL(row.id))}
            />
            {meta && (
              <Pagination
                currentPage={meta.currentPage}
                totalPages={meta.totalPages}
                totalRecords={meta.totalRecords}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
