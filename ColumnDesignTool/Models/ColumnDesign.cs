using System;
using System.Collections.Generic;

namespace ColumnDesignTool.Models
{
    public class ColumnDesign
    {
        // Identity
        public string Name    { get; set; }
        public string StoryName { get; set; }

        // Geometry (mm)
        public double Width   { get; set; }
        public double Depth   { get; set; }
        public double Height  { get; set; }
        public double Cover   { get; set; } = 40;

        // Materials (MPa)
        public double Fcu { get; set; } = 30;
        public double Fy  { get; set; } = 400;

        // Reinforcement
        public double RftPercent { get; set; } = 1.5;  // %
        public double LoadFactor { get; set; } = 1.5;

        // Load cases
        public List<LoadCombination> LoadCombinations { get; set; } = new List<LoadCombination>();

        // Governing result
        public DesignStatus OverallStatus  { get; set; } = DesignStatus.Undesigned;
        public double       MaxUtilization { get; set; }

        // --- Capacity helpers ---

        /// <summary>Pure axial capacity (kN) per ECP/ACI.</summary>
        public double PureAxialCapacity()
        {
            double Ag  = Width * Depth;                    // mm²
            double As  = Ag * RftPercent / 100.0;
            double Ac  = Ag - As;
            return (0.67 * Fcu * Ac + Fy * As) / 1000.0;  // kN
        }

        /// <summary>
        /// Simplified interaction curve: returns axial capacity (kN)
        /// for a given uniaxial moment demand (kN.m) using a linear
        /// interaction envelope (conservative).
        /// </summary>
        public double GetAxialCapacity(double momentKNm)
        {
            double P0  = PureAxialCapacity();
            double M0  = MaxMomentCapacity();
            if (M0 <= 0) return P0;
            double ratio = Math.Max(0, 1.0 - momentKNm / M0);
            return P0 * ratio;
        }

        /// <summary>Pure bending capacity (kN.m).</summary>
        public double MaxMomentCapacity()
        {
            double d   = Depth - Cover - 12;   // effective depth (assume 12mm link)
            double As  = Width * Depth * RftPercent / 100.0;
            double a   = (As * Fy) / (0.67 * Fcu * Width);
            return (As * Fy * (d - a / 2.0)) / 1e6;  // kN.m
        }

        public double CalculateUtilization(double P, double M)
        {
            double Pcap = GetAxialCapacity(M);
            return Pcap > 0 ? P / Pcap : double.PositiveInfinity;
        }
    }
}
