using System.Drawing;
using System.Windows.Forms;
using ColumnDesignTool.Models;
using ColumnDesignTool.Services;

namespace ColumnDesignTool.UI
{
    /// <summary>
    /// Panel that hosts and redraws the P-M interaction diagram.
    /// </summary>
    public class DiagramPanel : Panel
    {
        private readonly InteractionDiagramPlotter _plotter = new InteractionDiagramPlotter();
        private ColumnDesign _column;

        public DiagramPanel()
        {
            Dock        = DockStyle.Fill;
            DoubleBuffered = true;
            BackColor   = Color.White;
            BorderStyle = BorderStyle.FixedSingle;
        }

        public void UpdateDiagram(ColumnDesign col)
        {
            _column = col;
            Invalidate();
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);

            if (_column == null)
            {
                e.Graphics.DrawString(
                    "P-M Interaction Diagram will appear here after design.",
                    new Font("Segoe UI", 10f),
                    Brushes.Gray,
                    ClientRectangle.Left + 20,
                    ClientRectangle.Top  + ClientRectangle.Height / 2 - 10);
                return;
            }

            _plotter.Paint(e.Graphics, ClientRectangle, _column);
        }
    }
}
