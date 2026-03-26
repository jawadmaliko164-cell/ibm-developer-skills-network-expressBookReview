using System;
using System.Collections.Generic;
using System.Drawing;
using System.Windows.Forms;
using ColumnDesignTool.Models;

namespace ColumnDesignTool.Services
{
    /// <summary>
    /// Draws a P-M interaction diagram using GDI+ (no third-party dependency).
    /// Call <see cref="Paint"/> inside a Panel's Paint event.
    /// </summary>
    public class InteractionDiagramPlotter
    {
        // Layout constants
        private const int MarginLeft   = 70;
        private const int MarginBottom = 50;
        private const int MarginTop    = 30;
        private const int MarginRight  = 20;

        private readonly Color _safeColor    = Color.FromArgb(60, 0, 180, 0);
        private readonly Color _warningColor = Color.FromArgb(80, 255, 180, 0);
        private readonly Color _failColor    = Color.FromArgb(80, 220, 0, 0);

        // ------------------------------------------------------------------ //

        public void Paint(Graphics g, Rectangle bounds, ColumnDesign col)
        {
            int w = bounds.Width  - MarginLeft - MarginRight;
            int h = bounds.Height - MarginTop  - MarginBottom;
            if (w <= 0 || h <= 0) return;

            // Compute capacity envelope
            var envelope = BuildEnvelope(col, 60);

            double mMax = envelope.MMax * 1.15;
            double pMax = envelope.PMax * 1.15;

            g.Clear(Color.White);
            DrawAxes(g, bounds, w, h, mMax, pMax);
            DrawSafeZone(g, bounds, w, h, mMax, pMax, envelope);
            DrawCapacityCurve(g, bounds, w, h, mMax, pMax, envelope);
            DrawDesignPoints(g, bounds, w, h, mMax, pMax, col);
            DrawTitle(g, bounds, col);
        }

        // ------------------------------------------------------------------ //
        //  Envelope build
        // ------------------------------------------------------------------ //

        private (List<(double M, double P)> Points, double MMax, double PMax) BuildEnvelope(
            ColumnDesign col, int steps)
        {
            var pts  = new List<(double M, double P)>();
            double mCapMax = col.MaxMomentCapacity();
            double p0      = col.PureAxialCapacity();

            for (int i = 0; i <= steps; i++)
            {
                double m = mCapMax * i / steps;
                double p = col.GetAxialCapacity(m);
                pts.Add((m, p));
            }

            return (pts, mCapMax, p0);
        }

        // ------------------------------------------------------------------ //
        //  Drawing helpers
        // ------------------------------------------------------------------ //

        private void DrawAxes(Graphics g, Rectangle b, int w, int h,
                              double mMax, double pMax)
        {
            int ox = b.Left + MarginLeft;
            int oy = b.Top  + MarginTop + h;

            using var pen = new Pen(Color.Black, 1.5f);
            using var fnt = new Font("Segoe UI", 8f);
            using var br  = new SolidBrush(Color.Black);

            // Axes
            g.DrawLine(pen, ox, b.Top + MarginTop, ox, oy);
            g.DrawLine(pen, ox, oy, ox + w, oy);

            // Labels
            var fmt = new StringFormat { Alignment = StringAlignment.Center };
            g.DrawString("Moment  M  (kN·m)", fnt, br, ox + w / 2, oy + 30, fmt);

            var vfmt = new StringFormat
            {
                Alignment     = StringAlignment.Center,
                FormatFlags   = StringFormatFlags.DirectionVertical
            };
            g.DrawString("Axial Load  P  (kN)", fnt, br, b.Left + 12, b.Top + MarginTop + h / 2, vfmt);

            // Grid & tick marks (5 divisions each axis)
            using var gridPen = new Pen(Color.LightGray, 0.5f) { DashStyle = System.Drawing.Drawing2D.DashStyle.Dot };
            for (int i = 1; i <= 5; i++)
            {
                int gx = ox + i * w / 5;
                int gy = oy - i * h / 5;
                g.DrawLine(gridPen, gx, b.Top + MarginTop, gx, oy);
                g.DrawLine(gridPen, ox, gy, ox + w, gy);

                string mx = $"{mMax * i / 5:F0}";
                string py = $"{pMax * i / 5:F0}";
                g.DrawString(mx, fnt, br, gx, oy + 5, fmt);
                var rfmt = new StringFormat { Alignment = StringAlignment.Far };
                g.DrawString(py, fnt, br, ox - 4, gy - 7, rfmt);
            }
        }

        private void DrawSafeZone(Graphics g, Rectangle b, int w, int h,
                                  double mMax, double pMax,
                                  (List<(double M, double P)> Points, double MMax, double PMax) env)
        {
            int ox = b.Left + MarginLeft;
            int oy = b.Top  + MarginTop + h;

            var pts = new List<PointF>();
            foreach (var (m, p) in env.Points)
            {
                pts.Add(new PointF(ox + (float)(m / mMax * w),
                                   oy - (float)(p / pMax * h)));
            }
            // Close path back to origin
            pts.Add(new PointF(ox, oy));

            using var brush = new SolidBrush(_safeColor);
            g.FillPolygon(brush, pts.ToArray());
        }

        private void DrawCapacityCurve(Graphics g, Rectangle b, int w, int h,
                                       double mMax, double pMax,
                                       (List<(double M, double P)> Points, double MMax, double PMax) env)
        {
            int ox = b.Left + MarginLeft;
            int oy = b.Top  + MarginTop + h;

            var pts = new List<PointF>();
            foreach (var (m, p) in env.Points)
            {
                pts.Add(new PointF(ox + (float)(m / mMax * w),
                                   oy - (float)(p / pMax * h)));
            }

            using var pen = new Pen(Color.Green, 2.5f);
            if (pts.Count >= 2)
                g.DrawLines(pen, pts.ToArray());
        }

        private void DrawDesignPoints(Graphics g, Rectangle b, int w, int h,
                                      double mMax, double pMax, ColumnDesign col)
        {
            int ox = b.Left + MarginLeft;
            int oy = b.Top  + MarginTop + h;

            using var tipFont = new Font("Segoe UI", 7f);

            foreach (var lc in col.LoadCombinations)
            {
                if (!lc.IsActive) continue;

                double m = Math.Sqrt(lc.MomentX * lc.MomentX + lc.MomentY * lc.MomentY);
                double p = lc.AxialLoad;

                float px = ox + (float)(m / mMax * w);
                float py = oy - (float)(p / pMax * h);

                Color dotColor = lc.Status == DesignStatus.Pass    ? Color.Blue
                               : lc.Status == DesignStatus.Warning ? Color.DarkOrange
                                                                    : Color.Red;

                using var brush = new SolidBrush(dotColor);
                g.FillEllipse(brush, px - 5, py - 5, 10, 10);
                using var pen = new Pen(Color.DarkGray, 1f);
                g.DrawEllipse(pen, px - 5, py - 5, 10, 10);

                // Label
                using var lbr = new SolidBrush(Color.DimGray);
                g.DrawString(lc.Name, tipFont, lbr, px + 7, py - 5);
            }
        }

        private void DrawTitle(Graphics g, Rectangle b, ColumnDesign col)
        {
            using var fnt = new Font("Segoe UI", 9f, FontStyle.Bold);
            using var br  = new SolidBrush(Color.DarkSlateGray);
            var fmt = new StringFormat { Alignment = StringAlignment.Center };

            string title = $"P-M Interaction Diagram  |  {col.Name}  " +
                           $"({col.Width}×{col.Depth}mm)  " +
                           $"Fcu={col.Fcu} MPa  Fy={col.Fy} MPa  ρ={col.RftPercent}%";
            g.DrawString(title, fnt, br, b.Left + b.Width / 2, b.Top + 8, fmt);
        }
    }
}
