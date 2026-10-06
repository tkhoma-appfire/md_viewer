/** Cursor/VS Code–style table chrome (GFM tables need `remark-gfm`). */
export const markdownComponents = {
  table({ children, ...props }) {
    return (
      <div className="not-prose my-4 w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table
          className="m-0 w-max min-w-full border-collapse border-0 text-left text-sm leading-snug text-slate-800"
          {...props}
        >
          {children}
        </table>
      </div>
    );
  },
  thead({ children, ...props }) {
    return <thead {...props}>{children}</thead>;
  },
  tbody({ children, ...props }) {
    return <tbody {...props}>{children}</tbody>;
  },
  tr({ children, ...props }) {
    return (
      <tr className="even:bg-slate-50/90" {...props}>
        {children}
      </tr>
    );
  },
  th({ children, ...props }) {
    return (
      <th
        className="border border-slate-200 bg-slate-100 px-3 py-2 align-top font-semibold text-slate-900"
        {...props}
      >
        {children}
      </th>
    );
  },
  td({ children, ...props }) {
    return (
      <td
        className="border border-slate-200 px-3 py-2 align-top text-slate-700"
        {...props}
      >
        {children}
      </td>
    );
  },
};
