import Swal from 'sweetalert2';

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const toDateKey = (value) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const showSuccess = (title, text = '') =>
  Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonColor: '#06b6d4',
    timer: 1400,
    timerProgressBar: true,
    showConfirmButton: false,
  });

export const showError = (title, text = '') =>
  Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor: '#f97316',
  });

export const confirmAction = (title, text, confirmButtonText = 'Confirm') =>
  Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#334155',
  }).then((result) => result.isConfirmed);

export const showDueTodayAlert = async (tasks) => {
  if (typeof window === 'undefined') {
    return false;
  }

  const todayKey = toDateKey(new Date());
  const dueTodayTasks = tasks.filter(
    (task) => toDateKey(task.due) === todayKey,
  );

  if (!dueTodayTasks.length) {
    return false;
  }

  const listHtml = dueTodayTasks
    .map(
      (task) =>
        `<li class="rounded-lg border border-amber-200/20 bg-amber-50 px-3 py-2 text-left text-sm text-slate-700">${escapeHtml(task.task)}</li>`,
    )
    .join('');

  await Swal.fire({
    icon: 'warning',
    title: 'Tasks due today',
    html: `
      <p class="mb-3 text-sm text-slate-600">You have ${dueTodayTasks.length} task${dueTodayTasks.length > 1 ? 's' : ''} due today.</p>
      <ul class="space-y-2">${listHtml}</ul>
    `,
    confirmButtonText: 'Got it',
    confirmButtonColor: '#f59e0b',
  });

  return true;
};
