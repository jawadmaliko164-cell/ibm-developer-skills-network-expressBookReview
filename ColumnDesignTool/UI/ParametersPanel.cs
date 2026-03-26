using System;
using System.Drawing;
using System.Windows.Forms;
using ColumnDesignTool.Models;
using ColumnDesignTool.Utilities;

namespace ColumnDesignTool.UI
{
    /// <summary>
    /// Tab-based panel for entering material properties, geometry, and
    /// load combination selection.
    /// </summary>
    public class ParametersPanel : Panel
    {
        public event EventHandler ParametersChanged;

        // --- Material tab inputs ---
        public NumericUpDown FcuInput        { get; } = MakeNumeric(20, 100, Constants.DefaultFcu, 1);
        public NumericUpDown FyInput         { get; } = MakeNumeric(240, 600, Constants.DefaultFy, 10);
        public NumericUpDown LoadFactorInput { get; } = MakeNumeric(1.0m, 2.0m, (decimal)Constants.DefaultLoadFactor, 0.05m);
        public NumericUpDown HeightInput     { get; } = MakeNumeric(1000, 20000, 3500, 50);
        public NumericUpDown WidthInput      { get; } = MakeNumeric(200, 3000, 500, 25);
        public NumericUpDown DepthInput      { get; } = MakeNumeric(200, 3000, 500, 25);
        public NumericUpDown RftInput        { get; } = MakeNumeric(0.8m, 6.0m, 1.5m, 0.1m);

        // --- Load combos ---
        public CheckedListBox LoadCombosBox  { get; } = new CheckedListBox();

        private readonly TabControl _tabs = new TabControl();

        public ParametersPanel()
        {
            Dock = DockStyle.Fill;
            BuildTabs();
        }

        private void BuildTabs()
        {
            _tabs.Dock = DockStyle.Fill;

            _tabs.TabPages.Add(BuildMaterialTab());
            _tabs.TabPages.Add(BuildLoadCombosTab());
            Controls.Add(_tabs);
        }

        private TabPage BuildMaterialTab()
        {
            var page = new TabPage("Material & Geometry");
            var tbl  = new TableLayoutPanel
            {
                Dock        = DockStyle.Fill,
                ColumnCount = 2,
                RowCount    = 7,
                Padding     = new Padding(8)
            };
            tbl.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 55));
            tbl.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 45));

            AddRow(tbl, 0, "Fcu (MPa)",    FcuInput);
            AddRow(tbl, 1, "Fy (MPa)",     FyInput);
            AddRow(tbl, 2, "Load Factor",  LoadFactorInput);
            AddRow(tbl, 3, "Height (mm)",  HeightInput);
            AddRow(tbl, 4, "Width b (mm)", WidthInput);
            AddRow(tbl, 5, "Depth d (mm)", DepthInput);
            AddRow(tbl, 6, "RFT (%)",      RftInput);

            foreach (NumericUpDown n in new[] { FcuInput, FyInput, LoadFactorInput,
                                               HeightInput, WidthInput, DepthInput, RftInput })
                n.ValueChanged += (s, e) => ParametersChanged?.Invoke(this, EventArgs.Empty);

            page.Controls.Add(tbl);
            return page;
        }

        private TabPage BuildLoadCombosTab()
        {
            var page = new TabPage("Load Combinations");

            LoadCombosBox.Dock          = DockStyle.Fill;
            LoadCombosBox.CheckOnClick  = true;
            LoadCombosBox.Font          = new Font("Consolas", 8.5f);

            // Default combinations
            foreach (var combo in new[]
            {
                "1.5D + 1.8L + 0.4W",
                "1.2D + 1.6L",
                "0.9D + 1.4W",
                "1.5D + 1.5EQ",
                "1.4D + 1.6L + 0.5Lr"
            })
            {
                LoadCombosBox.Items.Add(combo, true);
            }

            LoadCombosBox.ItemCheck += (s, e) =>
                BeginInvoke((Action)(() => ParametersChanged?.Invoke(this, EventArgs.Empty)));

            page.Controls.Add(LoadCombosBox);
            return page;
        }

        private static void AddRow(TableLayoutPanel tbl, int row, string label, Control ctrl)
        {
            tbl.Controls.Add(new Label
            {
                Text      = label,
                TextAlign = ContentAlignment.MiddleRight,
                Dock      = DockStyle.Fill,
                Font      = new Font("Segoe UI", 9f)
            }, 0, row);
            ctrl.Dock = DockStyle.Fill;
            tbl.Controls.Add(ctrl, 1, row);
        }

        private static NumericUpDown MakeNumeric(decimal min, decimal max, decimal val, decimal inc)
        {
            return new NumericUpDown
            {
                Minimum       = min,
                Maximum       = max,
                Value         = Math.Max(min, Math.Min(max, val)),
                Increment     = inc,
                DecimalPlaces = inc < 1 ? 2 : 0
            };
        }

        // Overloads for int params
        private static NumericUpDown MakeNumeric(int min, int max, int val, int inc)
            => MakeNumeric((decimal)min, (decimal)max, (decimal)val, (decimal)inc);

        public ColumnDesign BuildColumnFromUI(string name = "COL1", string story = "")
        {
            var col = new ColumnDesign
            {
                Name        = name,
                StoryName   = story,
                Fcu         = (double)FcuInput.Value,
                Fy          = (double)FyInput.Value,
                LoadFactor  = (double)LoadFactorInput.Value,
                Height      = (double)HeightInput.Value,
                Width       = (double)WidthInput.Value,
                Depth       = (double)DepthInput.Value,
                RftPercent  = (double)RftInput.Value
            };

            for (int i = 0; i < LoadCombosBox.Items.Count; i++)
            {
                col.LoadCombinations.Add(new LoadCombination
                {
                    Name     = LoadCombosBox.Items[i].ToString(),
                    IsActive = LoadCombosBox.GetItemChecked(i)
                });
            }

            return col;
        }
    }
}
