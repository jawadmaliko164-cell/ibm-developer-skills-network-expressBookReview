namespace ColumnDesignTool.Models
{
    public class LoadCombination
    {
        public string Name { get; set; }        // e.g. "1.5D + 1.8L + 0.4W"
        public bool   IsActive { get; set; } = true;
        public double AxialLoad { get; set; }   // P (kN)
        public double MomentX   { get; set; }   // Mx (kN.m)
        public double MomentY   { get; set; }   // My (kN.m)
        public double ShearX    { get; set; }
        public double ShearY    { get; set; }

        // Design results
        public string RequiredBars  { get; set; }
        public string ProvidedBars  { get; set; }
        public double Utilization   { get; set; }   // 0-1
        public DesignStatus Status  { get; set; } = DesignStatus.Undesigned;
    }
}
