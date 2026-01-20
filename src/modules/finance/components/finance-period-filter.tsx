'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { PERIOD_PRESETS } from '../constants';

interface FinancePeriodFilterProps {
  onPeriodChange: (startDate: string, endDate: string) => void;
}

export function FinancePeriodFilter({ onPeriodChange }: FinancePeriodFilterProps) {
  const [selectedPreset, setSelectedPreset] = useState('this-month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);

    if (value !== 'custom') {
      const preset = PERIOD_PRESETS.find((p) => p.value === value);
      if (preset) {
        const { startDate, endDate } = preset.getRange();
        onPeriodChange(startDate, endDate);
      }
    }
  };

  const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setCustomStartDate(value);
      if (value && customEndDate) {
        onPeriodChange(value, customEndDate);
      }
    } else {
      setCustomEndDate(value);
      if (customStartDate && value) {
        onPeriodChange(customStartDate, value);
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPreset === 'custom' && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="start-date" className="text-xs text-muted-foreground">
              De
            </Label>
            <Input
              id="start-date"
              type="date"
              value={customStartDate}
              onChange={(e) => handleCustomDateChange('start', e.target.value)}
              className="w-[140px] h-9"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Label htmlFor="end-date" className="text-xs text-muted-foreground">
              Até
            </Label>
            <Input
              id="end-date"
              type="date"
              value={customEndDate}
              onChange={(e) => handleCustomDateChange('end', e.target.value)}
              className="w-[140px] h-9"
            />
          </div>
        </div>
      )}
    </div>
  );
}
