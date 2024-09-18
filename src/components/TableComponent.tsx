import React, { useEffect, useRef, useState } from "react";
import { FaAngleDown } from "react-icons/fa";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import axios from "axios";
import { Paginator } from "primereact/paginator";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";

const TableComponent = () => {
  const [data, setData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [page, setPage] = useState(0);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [allSelectedRows, setAllSelectedRows] = useState<any[]>([]);
  const [rowsInput, setRowsInput] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  const overlayPanelRef = useRef<OverlayPanel>(null);
  useEffect(() => {
    const fetchData = async (page: number, rowsPerPage: number) => {
      try {
        const response = await axios.get(
          `https://api.artic.edu/api/v1/artworks?page=${
            page + 1
          }&limit=${rowsPerPage}`
        );
        console.log(response.data.pagination.total);
        setData(response.data.data);
        setTotalRecords(response.data.pagination.total);
      } catch (err) {
        console.log("Error fetching data", err);
      }
    };
    fetchData(page, rowsPerPage);
  }, [page, rowsPerPage]);

  useEffect(() => {
    const isSelected = (row: any) =>
      allSelectedRows.some((r) => r.id === row.id);
    setSelectedRows(data.filter(isSelected));
  }, [data, allSelectedRows]);

  const handlePageChange = (e: any) => {
    setPage(e.page);
    setRowsPerPage(e.rows);
  };

  useEffect(() => {
    setSelectAll(selectedRows.length === data.length && data.length > 0);
  }, [selectedRows, data]);

  const handleSelectionChange = (e: any) => {
    const selected = e.value;
    const newAllSelectedRows = [...allSelectedRows];
    selected.forEach((row: any) => {
      if (!newAllSelectedRows.some((r) => r.id === row.id)) {
        newAllSelectedRows.push(row);
      }
    });
    const deselectedRows = data.filter(
      (row) => !selected.some((r: any) => r.id === row.id)
    );
    deselectedRows.forEach((row) => {
      const index = newAllSelectedRows.findIndex((r) => r.id === row.id);
      if (index > -1) {
        newAllSelectedRows.splice(index, 1);
      }
    });
    setAllSelectedRows(newAllSelectedRows);
    setSelectedRows(selected);
  };
  const handleDropdownClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (overlayPanelRef.current) {
      overlayPanelRef.current.toggle(e);
    }
  };

  const headerTemplate = (
    <div className="flex items-center">
      <div className="flex items-center space-x-2">
        <Button
          icon={<FaAngleDown />}
          onClick={handleDropdownClick}
          style={{ fontSize: "1.5rem", color: "gray" }}
        />
      </div>
    </div>
  );

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedRows([]);
      setAllSelectedRows([]);
    } else {
      setSelectedRows(data);
      setAllSelectedRows(data);
    }
    setSelectAll(!selectAll);
  };

  const handleSubmit = () => {
    const newRowsPerPage = parseInt(rowsInput, 10);
    if (!isNaN(newRowsPerPage) && newRowsPerPage > 0) {
      setRowsPerPage(newRowsPerPage);
      setPage(0);
      overlayPanelRef.current?.hide();

      const rowsToSelect = data.slice(0, newRowsPerPage);
      setSelectedRows(rowsToSelect);
    } else {
      alert("Enter a valid number of rows");
    }
  };
  return (
    <div className="mx-16 py-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Artworks</h1>
      <div className=" shadow-lg relative">
        <DataTable
          value={data}
          className="max-w-screen-xl bg-white divide-y divide-gray-700"
          tableStyle={{ minWidth: "50rem" }}
          selection={selectedRows}
          onSelectionChange={handleSelectionChange}
        >
          <Column
            header={headerTemplate}
            selectionMode="multiple"
            headerStyle={{ width: "5rem" }}
          />
          <Column
            field="title"
            header="Title"
            headerStyle={{
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
              paddingBlock: "16px",
              whiteSpace: "normal",
              textAlign: "center",
            }}
            className="px-4 py-4 "
          />
          <Column
            field="place_of_origin"
            header="Place of Origin"
            headerStyle={{
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
              textAlign: "center",
            }}
            className="px-4 py-2"
          />
          <Column
            field="artist_display"
            header="Artist Display"
            headerStyle={{
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
              paddingBlock: "16px",
              whiteSpace: "normal",
              maxWidth: "50px",
              wordWrap: "break-word",
              textAlign: "center",
            }}
            className="px-4 py-2"
          />
          <Column
            field="date_start"
            header="Date Start"
            headerStyle={{
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
              textAlign: "center",
            }}
            className="px-4 py-2"
          />
          <Column
            field="date_end"
            header="Date End"
            headerStyle={{
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
              textAlign: "center",
            }}
            className="px-4 py-2"
          />
        </DataTable>
        <Paginator
          first={page * rowsPerPage}
          rows={rowsPerPage}
          totalRecords={totalRecords}
          onPageChange={handlePageChange}
          className="mt-4"
          template={{ layout: "PrevPageLink CurrentPageReport NextPageLink" }}
        />
        <OverlayPanel ref={overlayPanelRef}>
          <div className="p-4 bg-gray-100 rounded-lg flex flex-col gap-4">
            <input
              type="text"
              placeholder="Select no. of rows"
              className="bg-transparent outline-none overflow-auto w-full h-full border border-gray-800 py-2 px-2 rounded-lg"
              value={rowsInput}
              onChange={(e) => setRowsInput(e.target.value)}
            />
            <button
              className="bg-black max-w-min text-white px-4 py-1.5 rounded-lg"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </OverlayPanel>
        <Button onClick={handleSelectAllChange} className="mt-4">
          {selectAll ? "Deselect All" : "Select All"}
        </Button>
      </div>
    </div>
  );
};

export default TableComponent;
