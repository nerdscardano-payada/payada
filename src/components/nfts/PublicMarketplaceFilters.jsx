import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PublicMarketplaceFilters({
  searchTerm,
  setSearchTerm,
  merchantOptions,
  collectionOptions,
  selectedMerchant,
  setSelectedMerchant,
  selectedCollection,
  setSelectedCollection,
  selectedFulfillment,
  setSelectedFulfillment,
  selectedVerified,
  setSelectedVerified,
  sortBy,
  setSortBy,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search NFT, collection or store"
          className="xl:col-span-2"
        />

        <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
          <SelectTrigger>
            <SelectValue placeholder="Merchant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All merchants</SelectItem>
            {merchantOptions.map((merchant) => (
              <SelectItem key={merchant} value={merchant}>{merchant}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCollection} onValueChange={setSelectedCollection}>
          <SelectTrigger>
            <SelectValue placeholder="Collection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All collections</SelectItem>
            {collectionOptions.map((collection) => (
              <SelectItem key={collection} value={collection}>{collection}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedFulfillment} onValueChange={setSelectedFulfillment}>
          <SelectTrigger>
            <SelectValue placeholder="Delivery" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All delivery</SelectItem>
            <SelectItem value="automatic">Automatic</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedVerified} onValueChange={setSelectedVerified}>
          <SelectTrigger>
            <SelectValue placeholder="Merchant type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All merchants</SelectItem>
            <SelectItem value="verified">Verified only</SelectItem>
            <SelectItem value="unverified">Unverified only</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
            <SelectItem value="newest">Newest first</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}