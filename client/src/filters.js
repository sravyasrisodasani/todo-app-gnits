export const FILTERS = {
  all: {
    label: "All tasks",
    test: () => true,
  },

  active: {
    label: "Active",
    test: (todo) => !todo.completed,
  },

  done: {
    label: "Completed",
    test: (todo) => todo.completed,
  },
};