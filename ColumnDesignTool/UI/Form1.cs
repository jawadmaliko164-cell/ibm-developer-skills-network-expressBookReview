using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Windows.Forms;
using ColumnDesignTool.Models;
using ColumnDesignTool.Services;
using ColumnDesignTool.Utilities;

namespace ColumnDesignTool.UI
{
    /// <summary>
    /// Main application form.
    /// Layout:
    ///   [Toolbar]
    ///   [StoryNavigator | ParametersPanel + DiagramPanel]
    ///   [ResultsPanel]
    /// </summary>
    public partial class Form1 : Form
    {
        // Services
        private readonly ETABSConnector  _etabs   = new ETABSConnector();
        private readonly DesignEngine    _engine  = new DesignEngine();
        private readonly ReportGenerator _reports = new ReportGenerator();

        // UI components
        private readonly StoryNavigator  _navigator  = new StoryNavigator();
        private readonly ParametersPanel _params     = new ParametersPanel();
        private readonly DiagramPanel    _diagram    = new DiagramPanel();
        private readonly ResultsPanel    _results    = new ResultsPanel();

        // State
        private List<StoryData> _stories = new List<StoryData>();
        private StoryData       _currentStory;
        private ColumnDesign    _currentColumn;

        // ------------------------------------------------------------------ //

        public Form1()
        {
            Text          = "Column Design Tool v2.0  –  ECP 203 / ACI 318";
            Size          = new Size(1100, 780);
            MinimumSize   = new Size(900, 600);
            StartPosition = FormStartPosition.CenterScreen;
            Font          = new Font("Segoe UI", 9f);

            BuildLayout();
            WireEvents();

            // Seed demo data so the app is usable immediately
            LoadDemoData();
        }

        // ------------------------------------------------------------------ //
        //  Layout
        // ------------------------------------------------------------------ //

        private void BuildLayout()
        {
            var toolbar = BuildToolbar();

            // Right side: params + diagram stacked
            var rightSplit = new SplitContainer
            {
                Dock        = DockStyle.Fill,
                Orientation = Orientation.Vertical,
                SplitterDistance = 280
            };
            rightSplit.Panel1.Controls.Add(_params);
            rightSplit.Panel2.Controls.Add(_diagram);

            // Main body: navigator | right
            var bodySplit = new SplitContainer
            {
                Dock        = DockStyle.Fill,
                Orientation = Orientation.Vertical,
                SplitterDistance = 185,
                FixedPanel  = FixedPanel.Panel1
            };
            bodySplit.Panel1.Controls.Add(_navigator);
            bodySplit.Panel2.Controls.Add(rightSplit);

            // Outer shell: toolbar / body / results
            var outer = new TableLayoutPanel
            {
                Dock      = DockStyle.Fill,
                RowCount  = 3,
                ColumnCount = 1
            };
            outer.RowStyles.Add(new RowStyle(SizeType.Absolute, 44));
            outer.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
            outer.RowStyles.Add(new RowStyle(SizeType.Absolute, 220));

            outer.Controls.Add(toolbar,   0, 0);
            outer.Controls.Add(bodySplit, 0, 1);
            outer.Controls.Add(_results,  0, 2);

            Controls.Add(outer);
        }

        private Panel BuildToolbar()
        {
            var bar = new Panel
            {
                Dock      = DockStyle.Top,
                Height    = 44,
                BackColor = Color.FromArgb(45, 62, 80)
            };

            var btnImport = MakeButton("📁  Import from ETABS", Color.FromArgb(52, 152, 219));
            var btnDesign = MakeButton("🧮  DESIGN",            Color.FromArgb(39, 174, 96));
            var btnDiagram= MakeButton("📈  View Diagram",      Color.FromArgb(142, 68, 173));
            var btnReport = MakeButton("📊  Export Report",     Color.FromArgb(230, 126, 34));

            btnImport.Click  += OnImportFromETABS;
            btnDesign.Click  += OnDesign;
            btnDiagram.Click += OnViewDiagram;
            btnReport.Click  += OnExportReport;

            int x = 8;
            foreach (var btn in new[] { btnImport, btnDesign, btnDiagram, btnReport })
            {
                btn.Left = x;
                x += btn.Width + 6;
                bar.Controls.Add(btn);
            }

            return bar;
        }

        private static Button MakeButton(string text, Color back)
        {
            return new Button
            {
                Text      = text,
                Height    = 30,
                Width     = 170,
                Top       = 7,
                BackColor = back,
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Font      = new Font("Segoe UI", 9f, FontStyle.Bold),
                Cursor    = Cursors.Hand
            };
        }

        // ------------------------------------------------------------------ //
        //  Events
        // ------------------------------------------------------------------ //

        private void WireEvents()
        {
            _navigator.StorySelected   += OnStorySelected;
            _params.ParametersChanged  += OnParametersChanged;
        }

        private void OnImportFromETABS(object sender, EventArgs e)
        {
            try
            {
                _etabs.Connect();
                _stories = _etabs.ExtractStories();

                var combos = _etabs.GetLoadCombinationNames();
                _params.LoadCombosBox.Items.Clear();
                foreach (var c in combos)
                    _params.LoadCombosBox.Items.Add(c, true);

                _navigator.LoadStories(_stories);
                MessageBox.Show($"Imported {_stories.Count} stories from ETABS.",
                    "Import Complete", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"ETABS import failed:\n{ex.Message}",
                    "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void OnStorySelected(object sender, StoryData story)
        {
            _currentStory = story;
            Text = $"Column Design Tool v2.0  –  Story: {story.Name}  (h={story.Height / 1000.0:F2} m)";
            RefreshCurrentColumn();
        }

        private void OnParametersChanged(object sender, EventArgs e) => RefreshCurrentColumn();

        private void OnDesign(object sender, EventArgs e)
        {
            if (_currentColumn == null) { RefreshCurrentColumn(); }
            if (_currentColumn == null) return;

            var errors = DataValidator.ValidateColumn(_currentColumn);
            if (errors.Count > 0)
            {
                MessageBox.Show(string.Join("\n", errors), "Validation Errors",
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            _engine.DesignColumn(_currentColumn);
            _results.ShowResults(_currentColumn);
            _diagram.UpdateDiagram(_currentColumn);
            _navigator.RefreshStatus();
        }

        private void OnViewDiagram(object sender, EventArgs e)
        {
            if (_currentColumn == null) return;
            _diagram.UpdateDiagram(_currentColumn);
        }

        private void OnExportReport(object sender, EventArgs e)
        {
            if (_currentStory == null) return;

            using var dlg = new SaveFileDialog
            {
                Filter   = "Text Report (*.txt)|*.txt|CSV Export (*.csv)|*.csv",
                FileName = $"ColumnDesign_{_currentStory.Name}_{DateTime.Now:yyyyMMdd}"
            };

            if (dlg.ShowDialog() != DialogResult.OK) return;

            if (dlg.FilterIndex == 1)
                _reports.SaveTextReport(_currentStory, dlg.FileName);
            else
                _reports.SaveCsvReport(_currentStory, dlg.FileName);

            MessageBox.Show("Report saved.", "Export", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        // ------------------------------------------------------------------ //
        //  Helpers
        // ------------------------------------------------------------------ //

        private void RefreshCurrentColumn()
        {
            string story = _currentStory?.Name ?? "";
            _currentColumn = _params.BuildColumnFromUI("COL1", story);
        }

        private void LoadDemoData()
        {
            var demoStories = new List<StoryData>
            {
                new StoryData { Name = "Foundation", Height = 0 },
                new StoryData { Name = "Level 1",    Height = 3500 },
                new StoryData { Name = "Level 2",    Height = 3000 },
                new StoryData { Name = "Level 3",    Height = 3000 },
                new StoryData { Name = "Level 4",    Height = 2800 },
                new StoryData { Name = "Roof",       Height = 2600 }
            };

            // Add demo columns with pre-populated loads
            foreach (var s in demoStories)
            {
                var col = new ColumnDesign
                {
                    Name = "COL1", StoryName = s.Name,
                    Fcu  = 30, Fy = 400, Width = 500, Depth = 500,
                    Height = s.Height, RftPercent = 1.5, LoadFactor = 1.5,
                    LoadCombinations = new System.Collections.Generic.List<LoadCombination>
                    {
                        new LoadCombination { Name="1.5D+1.8L", IsActive=true, AxialLoad=2450, MomentX=85,  MomentY=120 },
                        new LoadCombination { Name="1.2D+1.6L", IsActive=true, AxialLoad=1980, MomentX=65,  MomentY=95  },
                        new LoadCombination { Name="0.9D+1.4W", IsActive=true, AxialLoad=850,  MomentX=145, MomentY=175 },
                        new LoadCombination { Name="1.5D+1.5EQ",IsActive=true, AxialLoad=1200, MomentX=220, MomentY=240 }
                    }
                };
                s.Columns.Add(col);
            }

            _stories = demoStories;
            _navigator.LoadStories(_stories);
        }
    }
}
