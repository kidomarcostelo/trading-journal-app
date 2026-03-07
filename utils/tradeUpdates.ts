const processTradeUpdate = (currentTrade: any, updatedFields: any): any => {
  const result = { ...updatedFields }
  
  // Helper to find key case-insensitively
  const findKey = (obj: any, target: string) => 
    Object.keys(obj).find(k => k.toLowerCase() === target.toLowerCase())

  const statusKey = findKey(result, 'status')
  
  if (statusKey) {
     const newStatus = result[statusKey]
     const oldStatusKey = findKey(currentTrade, 'status') || 'Status'
     const oldStatus = currentTrade[oldStatusKey]
     
     // Check if status changed from Open to something else (Closed, Cancelled, Missed)
     if (String(newStatus).toLowerCase() !== String(oldStatus).toLowerCase() && 
         String(newStatus).toLowerCase() !== 'open') {
        
        const exitKey = findKey(currentTrade, 'exit date') || 'Exit Date'
        
        // Only set if not already present in the update
        if (!findKey(result, 'exit date')) {
            const now = new Date()
            const mm = String(now.getMonth() + 1).padStart(2, '0')
            const dd = String(now.getDate()).padStart(2, '0')
            const yyyy = now.getFullYear()
            
            // Use the correct casing from existing trade if possible, else default
            result[exitKey] = `${mm}/${dd}/${yyyy}`
        }
     }
  }

  return result
}

export { processTradeUpdate }
