using System;
using System.Drawing;
using System.Windows.Forms;
using ColumnDesignTool.Models;

namespace ColumnDesignTool.UI
{
    /// <summary>
    /// Enhanced DataGridView showing per-load-combination design results
    /// with conditional row colouring.
    /// </summary>
    public class ResultsPanel : Panel
    {
        private readonly DataGridView _grid     = new DataGridView();
        private readonly Label        _summary  = new Label();

        public ResultsPanel()
        {
            Dock = DockStyle.Bottom;
            Height = 220;

            _summary.Dock      = DockStyle.Top;
            _summary.Height    = 30;
            _summary.Font      = new Font("Segoe UI", 9f, FontStyle.Bold);
            _summary.TextAlign = ContentAlignment.MiddleLeft;
            _summary.Padding   = new Padding(8, 0, 0, 0);
            _summary.BackColor = Color.FromArgb(236, 240, 241);
            _summary.Text      = "No design performed yet.";

            _grid.Dock               = DockStyle.Fill;
            _grid.ReadOnly           = true;
            _grid.AllowUserToAddRows = false;
            _grid.RowHeadersVisible  = false;
            _grid.AutoSizeColumnsMode= DataGridViewAutoSizeColumnsMode.Fill;
            _grid.Font               = new Font("Consolas", 8.5f);
            _grid.SelectionMode      = DataGridViewSelectionMode.FullRowSelect;
            _grid.BorderStyle        = BorderStyle.None;
            _grid.GridColor          = Color.LightGray;
            _grid.DefaultCellStyle.Padding = new Padding(3);
            _grid.ColumnHeadersDefaultCellStyle.Font =
                new Font("Segoe UI", 9f, FontStyle.Bold);
            _grid.ColumnHeadersDefaultCellStyle.BackColor = Color.FromArgb(52, 73, 94);
            _grid.ColumnHeadersDefaultCellStyle.ForeColor = Color.White;
            _grid.EnableHeadersVisualStyles = false;

            AddColumn("LoadCombo",  "Load Combo",  0.22f);
            AddColumn("P",          "P (kN)",      0.10f);
            AddColumn("Mx",         "Mx (kN·m)",   0.10f);
            AddColumn("My",         "My (kN·m)",   0.10f);
            AddColumn("Required",   "Required",    0.15f);
            AddColumn("Provided",   "Provided",    0.13f);
            AddColumn("Util",       "Util %",      0.10f);
            AddColumn("Status",     "Status",      0.10f);

            Controls.Add(_grid);
            Controls.Add(_summary);
        }

        private void AddColumn(string name, string header, float fillWeight)
        {
            _grid.Columns.Add(new DataGridViewTextBoxColumn
            {
                Name       = name,
                HeaderText = header,
                FillWeight = fillWeight * 1000
            });
        }

        public void ShowResults(ColumnDesign col)
        {
            _grid.Rows.Clear();

            foreach (var lc in col.LoadCombinations)
            {
                if (!lc.IsActive) continue;

                int idx = _grid.Rows.Add(
                    lc.Name,
                    $"{lc.AxialLoad:F1}",
                    $"{lc.MomentX:F1}",
                    $"{lc.MomentY:F1}",
                    lc.RequiredBars ?? "—",
                    lc.ProvidedBars ?? "—",
                    lc.Status == DesignStatus.Undesigned ? "—" : $"{lc.Utilization:P0}",
                    StatusIcon(lc.Status));

                var row = _grid.Rows[idx];
                row.DefaultCellStyle.BackColor = lc.Status switch
                {
                    DesignStatus.Pass    => Color.FromArgb(220, 255, 220),
                    DesignStatus.Warning => Color.FromArgb(255, 250, 200),
                    DesignStatus.Fail    => Color.FromArgb(255, 210, 210),
                    _                   => Color.White
                };
            }

            // Summary bar
            string icon = col.OverallStatus switch
            {
                DesignStatus.Pass    => "✓ SAFE",
                DesignStatus.Warning => "⚠ WARNING",
                DesignStatus.Fail    => "✗ FAIL",
                _                   => "—"
            };
            _summary.Text = $"  Column: {col.Name}  |  Status: {icon}" +
                            $"  |  Max Utilization: {col.MaxUtilization:P1}" +
                            $"  |  Section: {col.Width}×{col.Depth} mm";
            _summary.ForeColor = col.OverallStatus switch
            {
                DesignStatus.Pass    => Color.DarkGreen,
                DesignStatus.Warning => Color.DarkOrange,
                DesignStatus.Fail    => Color.DarkRed,
                _                   => Color.Black
            };
        }

        private static string StatusIcon(DesignStatus s) => s switch
        {
            DesignStatus.Pass    => "✓ Pass",
            DesignStatus.Warning => "⚠ Warn",
            DesignStatus.Fail    => "✗ Fail",
            _                   => "—"
        };
    }
}
