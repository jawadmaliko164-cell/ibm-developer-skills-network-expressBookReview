using System;
using System.Collections.Generic;
using ColumnDesignTool.Models;

namespace ColumnDesignTool.Services
{
    /// <summary>
    /// Column design engine – ECP 203 / ACI 318 simplified approach.
    /// Iterates through load combinations, calculates required reinforcement,
    /// and flags utilisation.
    /// </summary>
    public class DesignEngine
    {
        // Standard bar diameters (mm) – ascending
        private static readonly int[] BarDiameters = { 10, 12, 16, 20, 22, 25, 28, 32 };

        // ------------------------------------------------------------------ //

        public void DesignColumn(ColumnDesign col)
        {
            double maxUtilization = 0;

            foreach (var lc in col.LoadCombinations)
            {
                if (!lc.IsActive) continue;

                // Combined moment
                double M = Math.Sqrt(lc.MomentX * lc.MomentX + lc.MomentY * lc.MomentY);
                double P = lc.AxialLoad;

                // Required steel area (mm²) from simplified P-M interaction
                double AsRequired = RequiredSteel(col, P, M);
                double Ag         = col.Width * col.Depth;
                double rhoRequired = AsRequired / Ag * 100;  // %

                // Clamp to code limits (0.8% – 6%)
                rhoRequired = Math.Max(0.8, Math.Min(6.0, rhoRequired));

                // Select bar arrangement
                SelectBars(col, rhoRequired, out int barCount, out int barDia);
                double AsProvided = barCount * Math.PI / 4.0 * barDia * barDia;

                lc.RequiredBars = $"{barCount}#{barDia} (ρ={rhoRequired:F2}%)";
                lc.ProvidedBars = $"{barCount}Ø{barDia}mm";
                lc.Utilization  = col.CalculateUtilization(P, M);
                lc.Status       = lc.Utilization <= 1.0
                    ? (lc.Utilization >= 0.75 ? DesignStatus.Warning : DesignStatus.Pass)
                    : DesignStatus.Fail;

                if (lc.Utilization > maxUtilization)
                    maxUtilization = lc.Utilization;
            }

            col.MaxUtilization = maxUtilization;
            col.OverallStatus  = maxUtilization <= 1.0
                ? (maxUtilization >= 0.75 ? DesignStatus.Warning : DesignStatus.Pass)
                : DesignStatus.Fail;
        }

        // ------------------------------------------------------------------ //
        //  Reinforcement calculation
        // ------------------------------------------------------------------ //

        private double RequiredSteel(ColumnDesign col, double P, double M)
        {
            // Eccentricity
            double e = P > 0 ? M * 1000.0 / P : double.MaxValue;   // mm  (M in kN.m, P in kN)

            double Ag = col.Width * col.Depth;
            double d  = col.Depth - col.Cover - 12;    // effective depth

            // Simplified: balance point strain-based required area
            double Pbf = 0.85 * col.Fcu * col.Width * (0.003 / (0.003 + col.Fy / 200000.0)) * d;
            Pbf /= 1000.0;  // kN

            double rhoMin = P > Pbf
                ? ((P * 1000 - 0.67 * col.Fcu * Ag) / col.Fy)   // axial dominant
                : (P * 1000 * e / (col.Fy * (d - col.Cover)));   // moment dominant

            return Math.Max(rhoMin, 0.008 * Ag);
        }

        private void SelectBars(ColumnDesign col, double rhoPercent,
                                out int barCount, out int barDia)
        {
            double AsNeeded = col.Width * col.Depth * rhoPercent / 100.0;

            // Minimum 4 bars in a rectangular section
            int minBars = 4;

            foreach (int dia in BarDiameters)
            {
                double aBar = Math.PI / 4.0 * dia * dia;
                int n = (int)Math.Ceiling(AsNeeded / aBar);
                n = Math.Max(n, minBars);

                // Ensure bars fit: perimeter spacing check (min 50mm clear)
                double perimeter = 2 * (col.Width + col.Depth) - 8 * col.Cover;
                double spacing   = perimeter / n;
                if (spacing >= (dia + 50))
                {
                    barCount = n;
                    barDia   = dia;
                    return;
                }
            }

            // Fallback – max dia, min count
            barDia   = BarDiameters[BarDiameters.Length - 1];
            barCount = (int)Math.Ceiling(AsNeeded / (Math.PI / 4.0 * barDia * barDia));
            barCount = Math.Max(barCount, minBars);
        }

        // ------------------------------------------------------------------ //
        //  Batch design: entire story
        // ------------------------------------------------------------------ //

        public void DesignStory(StoryData story)
        {
            foreach (var col in story.Columns)
                DesignColumn(col);

            // Story-level status = worst column
            bool anyFail    = story.Columns.Exists(c => c.OverallStatus == DesignStatus.Fail);
            bool anyWarning = story.Columns.Exists(c => c.OverallStatus == DesignStatus.Warning);
            story.Status    = anyFail    ? DesignStatus.Fail
                            : anyWarning ? DesignStatus.Warning
                                         : DesignStatus.Pass;
        }
    }
}
