export default class Utils {


    public static spaceOrCommaList(str:string): string[] {
        return str.split(' ').join(',').split(',').map(r => r.trim()).filter(r => 1 && r);
    }



    
}