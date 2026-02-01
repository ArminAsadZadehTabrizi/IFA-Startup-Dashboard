"use client"

import { Search, Filter, X, Flame, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NewsCategory, CATEGORY_CONFIG } from "@/lib/types-news"

interface NewsFilterProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategories: NewsCategory[]
  onCategoriesChange: (categories: NewsCategory[]) => void
  showHighImpactOnly: boolean
  onHighImpactChange: (show: boolean) => void
  showVerifiedOnly: boolean
  onVerifiedChange: (show: boolean) => void
  totalNews: number
  filteredCount: number
}

export function NewsFilter({
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoriesChange,
  showHighImpactOnly,
  onHighImpactChange,
  showVerifiedOnly,
  onVerifiedChange,
  totalNews,
  filteredCount
}: NewsFilterProps) {
  const categories = Object.keys(CATEGORY_CONFIG) as NewsCategory[]
  
  const toggleCategory = (category: NewsCategory) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(c => c !== category))
    } else {
      onCategoriesChange([...selectedCategories, category])
    }
  }
  
  const clearAllFilters = () => {
    onSearchChange("")
    onCategoriesChange([])
    onHighImpactChange(false)
    onVerifiedChange(false)
  }
  
  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || showHighImpactOnly || showVerifiedOnly
  
  return (
    <div className="space-y-4">
      {/* Search & Quick Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="News durchsuchen..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant={showHighImpactOnly ? "default" : "outline"}
            size="sm"
            onClick={() => onHighImpactChange(!showHighImpactOnly)}
            className={showHighImpactOnly ? "bg-red-600 hover:bg-red-700" : ""}
          >
            <Flame className="w-4 h-4 mr-1" />
            High Impact
          </Button>
          
          <Button
            variant={showVerifiedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => onVerifiedChange(!showVerifiedOnly)}
            className={showVerifiedOnly ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Verifiziert
          </Button>
        </div>
      </div>
      
      {/* Category Filter Row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <Filter className="w-4 h-4" />
          Kategorien:
        </span>
        
        {categories.map(category => {
          const config = CATEGORY_CONFIG[category]
          const isSelected = selectedCategories.includes(category)
          
          return (
            <Badge
              key={category}
              variant="outline"
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? `${config.bgColor} ${config.color} ${config.borderColor} ring-2 ring-offset-1 ring-current/20` 
                  : "hover:bg-muted"
              }`}
              onClick={() => toggleCategory(category)}
            >
              <span className="mr-1">{config.emoji}</span>
              {config.label}
              {isSelected && <X className="w-3 h-3 ml-1" />}
            </Badge>
          )
        })}
        
        {/* Clear All Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4 mr-1" />
            Filter zurücksetzen
          </Button>
        )}
      </div>
      
      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {hasActiveFilters ? (
          <span>
            <span className="font-medium text-foreground">{filteredCount}</span> von {totalNews} News gefunden
          </span>
        ) : (
          <span>
            <span className="font-medium text-foreground">{totalNews}</span> News insgesamt
          </span>
        )}
      </div>
    </div>
  )
}

