declare module "react-native-svg-charts" {
  import { Component } from "react";
  import { ViewStyle } from "react-native";

  export interface PieChartData {
    key: string;
    value: number;
    svg?: {
      fill?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }

  export interface PieChartProps {
    data: PieChartData[];
    style?: ViewStyle;
    innerRadius?: string | number;
    outerRadius?: string | number;
    padAngle?: number;
    [key: string]: any;
  }

  export class PieChart extends Component<PieChartProps> {}
}
