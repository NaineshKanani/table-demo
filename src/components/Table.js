import {
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Button } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { jsPDF } from "jspdf"; //or use your library of choice here
import autoTable from "jspdf-autotable";
import { mockData } from "../container/makeData";

const columnHelper = createMRTColumnHelper();

const columns = [
  columnHelper.accessor("id", {
    header: "ID",
    size: 40,
  }),

  columnHelper.accessor("img", {
    header: "Img",
    size: 40,
    Cell: ({ renderedCellValue, row }) => (
      <img src={renderedCellValue} alt={row.firstName} width={40} height={40} />
    ),
  }),

  columnHelper.accessor("firstName", {
    header: "First Name",
    size: 120,
  }),
  columnHelper.accessor("lastName", {
    header: "Last Name",
    size: 120,
  }),
  columnHelper.accessor("company", {
    header: "Company",
    size: 300,
  }),
  columnHelper.accessor("city", {
    header: "City",
  }),
  columnHelper.accessor("country", {
    header: "Country",
    size: 220,
  }),
];

const Table = () => {
  const handleExportRows = (rows) => {
    const doc = new jsPDF();
    const mappedData = rows?.map(({ original }) => {
      const newRow = { ...original };
      return newRow;
    });

    doc.autoTable({
      head: [columns.map((column) => column.header)],
      body: mappedData.map((row) => columns.map((column) => row[column.id])),
      // doc.cell
      didParseCell: async function (data) {
        const imgIndex = columns.findIndex((col) => col.id === "img");
        if (data.column.index === imgIndex && data.cell.section === "body") {
          data.cell.text = "";
        }
      },

      didDrawCell: async function (data) {
        const imgIndex = columns.findIndex((col) => col.id === "img");

        if (data.column.index === imgIndex && data.cell.section === "body") {
          const img = new Image();
          const imgSrc = data.cell.raw;
          img.src = imgSrc;
          const dim = data.cell.height - data.cell.padding("vertical");
          const textPos = data.cell;
          doc.addImage(img, "PNG", textPos.x, textPos.y, 7, 7);
        }
      },
    });

    doc.save("table.pdf");
  };
  const table = useMaterialReactTable({
    columns,
    data: mockData,
    enableRowSelection: true,
    columnFilterDisplayMode: "popover",
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    renderTopToolbarCustomActions: ({ table }) => (
      <Box
        sx={{
          display: "flex",
          gap: "16px",
          padding: "8px",
          flexWrap: "wrap",
        }}
      >
        <Button
          disabled={table.getPrePaginationRowModel().rows.length === 0}
          //export all rows, including from the next page, (still respects filtering and sorting)
          onClick={() =>
            handleExportRows(table.getPrePaginationRowModel().rows)
          }
          startIcon={<FileDownloadIcon />}
        >
          Export All Rows
        </Button>
        <Button
          disabled={table.getRowModel().rows.length === 0}
          //export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
          onClick={() => handleExportRows(table.getRowModel().rows)}
          startIcon={<FileDownloadIcon />}
        >
          Export Page Rows
        </Button>
        <Button
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          //only export selected rows
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          startIcon={<FileDownloadIcon />}
        >
          Export Selected Rows
        </Button>
      </Box>
    ),
  });

  return <MaterialReactTable table={table} />;
};

export default Table;
