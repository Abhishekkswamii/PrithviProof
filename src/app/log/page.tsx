"use client";

import React, { useState } from "react";
import { useStore } from "@/data/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Activity, UserConstraints } from "@/domain/models";
import { localFactors } from "@/domain/factors";

export default function LogData() {
  const { isInitialized, activities, constraints, updateConstraints, addActivity } = useStore();
  
  const [logForm, setLogForm] = useState({ categoryId: "transport", factorId: "f-scooter-gas", value: "", unit: "km", dataQualityScore: "80" });
  const [constForm, setConstForm] = useState<UserConstraints | null>(null);

  // Initialize constForm once
  if (isInitialized && !constForm) {
    setConstForm(constraints);
  }

  if (!isInitialized) return <div className="p-8 text-center" aria-live="polite">Loading...</div>;

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logForm.value) return;

    const newActivity: Activity = {
      id: `act-manual-${Date.now()}`,
      categoryId: logForm.categoryId as Activity["categoryId"],
      factorId: logForm.factorId,
      value: parseFloat(logForm.value),
      unit: logForm.unit as Activity["unit"],
      dataQualityScore: parseInt(logForm.dataQualityScore)
    };
    addActivity(newActivity);
    setLogForm({ ...logForm, value: "" }); // Reset value
  };

  const handleConstraintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (constForm) {
      updateConstraints(constForm);
      alert("Constraints updated! Recommendations will now be filtered.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-charcoal-900">Data Log & Settings</h1>
        <p className="text-charcoal-600 mt-1">Manually enter activities or update your profile constraints.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section aria-labelledby="manual-log">
          <Card>
            <CardHeader>
              <CardTitle id="manual-log">Manual Activity Entry</CardTitle>
              <CardDescription>Directly log emissions from a specific activity.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogSubmit} className="space-y-4">
                <div>
                  <label htmlFor="factor" className="block text-sm font-medium text-charcoal-700 mb-1">Source</label>
                  <select 
                    id="factor"
                    className="w-full h-11 rounded-md border border-charcoal-300 bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                    value={logForm.factorId}
                    onChange={e => {
                      const factor = localFactors.find(f => f.id === e.target.value);
                      if (factor) {
                        setLogForm({...logForm, factorId: factor.id, categoryId: factor.category, unit: factor.unit});
                      }
                    }}
                  >
                    {localFactors.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.unit})</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label htmlFor="value" className="block text-sm font-medium text-charcoal-700 mb-1">Amount ({logForm.unit})</label>
                    <Input 
                      id="value" 
                      type="number" 
                      step="any"
                      required
                      value={logForm.value}
                      onChange={e => setLogForm({...logForm, value: e.target.value})}
                    />
                  </div>
                  <div className="w-24">
                    <label htmlFor="quality" className="block text-sm font-medium text-charcoal-700 mb-1">Confidence</label>
                    <Input 
                      id="quality" 
                      type="number" 
                      min="0" max="100"
                      required
                      value={logForm.dataQualityScore}
                      onChange={e => setLogForm({...logForm, dataQualityScore: e.target.value})}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-charcoal-900 mt-2">Log Activity</Button>
              </form>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="constraints-log">
          <Card>
            <CardHeader>
              <CardTitle id="constraints-log">User Constraints</CardTitle>
              <CardDescription>We use this to filter out impossible recommendations.</CardDescription>
            </CardHeader>
            <CardContent>
              {constForm && (
                <form onSubmit={handleConstraintSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-charcoal-700 mb-1">Available Budget (INR/USD)</label>
                    <Input 
                      id="budget" 
                      type="number" 
                      required
                      value={constForm.budgetAvailable}
                      onChange={e => setConstForm({...constForm, budgetAvailable: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="housing" className="block text-sm font-medium text-charcoal-700 mb-1">Housing Type</label>
                    <select 
                      id="housing"
                      className="w-full h-11 rounded-md border border-charcoal-300 bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                      value={constForm.housingType}
                      onChange={e => setConstForm({...constForm, housingType: e.target.value as UserConstraints["housingType"]})}
                    >
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="shared">Shared Student Accomodation</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="ownership" className="block text-sm font-medium text-charcoal-700 mb-1">Ownership</label>
                    <select 
                      id="ownership"
                      className="w-full h-11 rounded-md border border-charcoal-300 bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                      value={constForm.ownership}
                      onChange={e => setConstForm({...constForm, ownership: e.target.value as UserConstraints["ownership"]})}
                    >
                      <option value="rent">Rent</option>
                      <option value="own">Own</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="hasCar" 
                      className="h-4 w-4 rounded border-charcoal-300 text-teal-600 focus:ring-teal-500"
                      checked={constForm.hasCar}
                      onChange={e => setConstForm({...constForm, hasCar: e.target.checked})}
                    />
                    <label htmlFor="hasCar" className="text-sm font-medium text-charcoal-700">I own a car</label>
                  </div>

                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 mt-2">Save Profile Constraints</Button>
                </form>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
      
      <section className="pt-8">
        <h2 className="text-xl font-bold mb-4 border-b border-charcoal-200 pb-2">Recent Raw Activities</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-charcoal-100 text-charcoal-800">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Factor</th>
                <th className="px-4 py-2">Value</th>
                <th className="px-4 py-2">Quality</th>
              </tr>
            </thead>
            <tbody>
              {activities.slice(-5).reverse().map(act => (
                <tr key={act.id} className="border-b border-charcoal-100">
                  <td className="px-4 py-2 font-mono text-xs">{act.id}</td>
                  <td className="px-4 py-2 capitalize">{act.categoryId}</td>
                  <td className="px-4 py-2">{act.factorId}</td>
                  <td className="px-4 py-2">{act.value} {act.unit}</td>
                  <td className="px-4 py-2">{act.dataQualityScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
