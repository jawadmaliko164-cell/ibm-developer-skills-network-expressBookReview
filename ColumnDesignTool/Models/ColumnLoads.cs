namespace ColumnDesignTool.Models
{
    public class ColumnLoads
    {
        public double P  { get; set; }   // Axial (kN)
        public double Mx { get; set; }   // Moment X (kN.m)
        public double My { get; set; }   // Moment Y (kN.m)
        public double Vx { get; set; }   // Shear X (kN)
        public double Vy { get; set; }   // Shear Y (kN)
        public double T  { get; set; }   // Torsion (kN.m)
        public string LoadCombination { get; set; }
    }
}
