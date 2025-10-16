// Excel import/export utility using SheetJS
// Requires: https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js

// Export tasks to Excel
window.exportTasksToExcel = function(tasks, filename = 'tasks.xlsx') {
  const getPriorityColor = (priority) => {
    const p = (priority || '').toString().toLowerCase();
    if (p === 'high') return '#ef4444';     // red-500
    if (p === 'medium') return '#f59e0b';   // amber-500
    return '#22c55e';                        // green-500 (low/default)
  };
  const getCategoryColor = (name) => {
    const n = (name || '').toString().toLowerCase();
    if (n === 'work') return '#4CAF50';
    if (n === 'personal') return '#2196F3';
    if (n === 'shopping') return '#FF9800';
    if (n === 'health') return '#E91E63';
    return '#9CA3AF'; // default gray
  };

  const wsData = [
    ['Title', 'Description', 'Due Date', 'Category', 'Category Color', 'Priority', 'Priority Color', 'Subtasks'],
    ...tasks.map(task => [
      task.text,
      task.description || '',
      task.dueDate || '',
      task.category?.name || '',
      task.category?.color || getCategoryColor(task.category?.name),
      task.priority || '',
      task.priorityColor || getPriorityColor(task.priority),
      Array.isArray(task.subtasks) ? task.subtasks.map(s => s.text).join('; ') : ''
    ])
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
  // Add Category Summary sheet (Category, Color, Count)
  try {
    const counts = {};
    (tasks || []).forEach(t => {
      const name = t?.category?.name || 'Uncategorized';
      const color = t?.category?.color || '';
      if (!counts[name]) counts[name] = { count: 0, color: color };
      counts[name].count += 1;
      // prefer first non-empty color seen
      if (!counts[name].color && color) counts[name].color = color;
    });
    const summaryData = [
      ['Category', 'Color', 'Count'],
      ...Object.entries(counts).map(([name, info]) => [name, info.color || '', info.count])
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
  } catch (e) {
    console.warn('Summary sheet generation failed:', e);
  }
  XLSX.writeFile(wb, filename);
 }// Import tasks from Excel
window.importTasksFromExcel = function(file, callback) {
  console.log('Starting import from file:', file.name);
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      console.log('Parsed rows from Excel:', rows);

      if (!rows || rows.length === 0) {
        callback([]);
        return;
      }

      // Normalize and index headers by name for flexible ordering
      const headerRow = rows[0].map(h => (h || '').toString().trim().toLowerCase());
      const idxOf = (name) => headerRow.indexOf(name.toLowerCase());
      const col = {
        title: idxOf('title'),
        description: idxOf('description'),
        dueDate: idxOf('due date') !== -1 ? idxOf('due date') : idxOf('duedate'),
        category: idxOf('category'),
        categoryColor: idxOf('category color'),
        priority: idxOf('priority'),
        priorityColor: idxOf('priority color'),
        subtasks: idxOf('subtasks')
      };

      const fallbackCategoryColor = (name) => {
        const n = (name || '').toString().toLowerCase();
        if (n === 'work') return '#4CAF50';
        if (n === 'personal') return '#2196F3';
        if (n === 'shopping') return '#FF9800';
        if (n === 'health') return '#E91E63';
        return '#9CA3AF';
      };

      const tasks = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i] || [];
        // Skip row if all key columns are empty
        const titleVal = col.title >= 0 ? row[col.title] : undefined;
        if (!titleVal) continue;

        const descriptionVal = col.description >= 0 ? row[col.description] : '';
        const dueDateVal = col.dueDate >= 0 ? row[col.dueDate] : '';
        const categoryVal = col.category >= 0 ? row[col.category] : '';
        const categoryColorVal = col.categoryColor >= 0 ? row[col.categoryColor] : '';
        const priorityVal = col.priority >= 0 ? row[col.priority] : '';
        const priorityColorVal = col.priorityColor >= 0 ? row[col.priorityColor] : '';
        const subtasksVal = col.subtasks >= 0 ? row[col.subtasks] : '';

        const parsedSubtasks = (subtasksVal ? String(subtasksVal) : '')
          .split(';')
          .map(s => s.trim())
          .filter(Boolean)
          .map(s => ({ text: s, completed: false }));

        tasks.push({
          text: String(titleVal),
          description: descriptionVal ? String(descriptionVal) : '',
          dueDate: dueDateVal ? String(dueDateVal) : '',
          category: {
            name: categoryVal ? String(categoryVal) : 'Work',
            color: categoryColorVal ? String(categoryColorVal) : fallbackCategoryColor(categoryVal)
          },
          priority: priorityVal ? String(priorityVal) : 'medium',
          priorityColor: priorityColorVal ? String(priorityColorVal) : undefined,
          subtasks: parsedSubtasks
        });
      }
      console.log('Imported tasks:', tasks);
      callback(tasks);
    } catch (error) {
      console.error('Error importing Excel file:', error);
      alert('Error importing file: ' + error.message);
    }
  };
  reader.onerror = function(error) {
    console.error('FileReader error:', error);
    alert('Error reading file');
  };
  reader.readAsArrayBuffer(file);
}
