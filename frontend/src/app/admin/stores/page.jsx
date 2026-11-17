'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import { adminApi } from '../../../services/admin.service';
import { Navbar } from '../../../components/layout/Navbar';
import { Table } from '../../../components/ui/Table';
import { Pagination } from '../../../components/ui/Pagination';
import { SearchBar } from '../../../components/ui/SearchBar';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { ErrorState } from '../../../components/ui/ErrorState';
import { RatingDisplay } from '../../../components/ui/Rating';
import { ROUTES } from '../../../lib/constants';
export default function AdminStoresPage() {
    const router = useRouter();
    const [stores, setStores] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchStores = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                limit: 10,
                sortBy,
                sortOrder,
            };
            if (debouncedSearch)
                params.search = debouncedSearch;
            const result = await adminApi.getStores(params);
            setStores(result.data);
            setMeta(result.meta);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load stores');
        }
        finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, sortBy, sortOrder]);

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);
    const handleSort = (key) => {
        if (sortBy === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        }
        else {
            setSortBy(key);
            setSortOrder('asc');
        }
        setPage(1);
    };
    const columns = [
        {
            key: 'name',
            header: 'Store Name',
            sortable: true,
            render: (row) => <span className="font-medium text-gray-900">{row.name}</span>,
        },
        { key: 'email', header: 'Email', sortable: true },
        {
            key: 'address',
            header: 'Address',
            render: (row) => <span className="text-gray-500">{row.address || '—'}</span>,
        },
        {
            key: 'owner',
            header: 'Owner',
            render: (row) => row.owner ? (<span className="text-gray-700">{row.owner.name}</span>) : (<span className="text-gray-400">—</span>),
        },
        {
            key: 'rating',
            header: 'Rating',
            sortable: true,
            render: (row) => (<div className="flex items-center gap-2">
          <RatingDisplay value={row.averageRating} size="sm" showValue={true}/>
          {row.totalRatings > 0 && (<Badge color="bg-gray-100 text-gray-500">({row.totalRatings})</Badge>)}
        </div>),
        },
    ];
    return (<>
      <Navbar title="Store Management" subtitle="View and manage all stores" actions={<Button onClick={() => router.push(ROUTES.ADMIN_ADD_STORE)} className="hidden sm:flex">
            <PlusCircle className="h-4 w-4"/>
            Add Store
          </Button>}/>

      <div className="space-y-4">
        {/* Mobile add button */}
        <Button onClick={() => router.push(ROUTES.ADMIN_ADD_STORE)} fullWidth className="sm:hidden">
          <PlusCircle className="h-4 w-4"/>
          Add Store
        </Button>

        {/* Search */}
        <SearchBar value={search} onChange={setSearch} placeholder="Search by store name or address..."/>

        {/* Table */}
        {error ? (<ErrorState message={error} onRetry={fetchStores}/>) : (<>
            <Table columns={columns} data={stores} loading={loading} emptyMessage="No stores found" onSort={handleSort} sortKey={sortBy} sortOrder={sortOrder}/>
            {meta && (<Pagination currentPage={meta.currentPage} totalPages={meta.totalPages} totalRecords={meta.totalRecords} onPageChange={setPage}/>)}
          </>)}
      </div>
    </>);
}
