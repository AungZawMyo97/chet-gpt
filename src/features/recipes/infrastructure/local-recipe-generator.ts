import type { RecipeGenerator } from "@/features/recipes/application/generate-recipes-use-case";
import type {
  RecipeRequest,
  RecipeResult,
  RecipeSuggestion,
} from "@/features/recipes/domain/recipe";

const pantryBasics = ["ဆီ", "ဆား", "နနွင်း", "ကြက်သွန်ဖြူ"];

export class LocalRecipeGenerator implements RecipeGenerator {
  async generate(request: RecipeRequest): Promise<RecipeResult> {
    const mainIngredient = request.ingredients[0];
    const supportingIngredients = request.ingredients.slice(1, 4);
    const basics = pantryBasics.filter(
      (item) => !request.ingredients.includes(item),
    );

    return {
      source: "local",
      note: "AI key မရှိသေးလို့ အနီးစပ်ဆုံး ဟင်းအကြံပြုချက်တွေကို ပြထားပါတယ်။",
      recipes: [
        this.createCurryRecipe(mainIngredient, supportingIngredients, basics),
        this.createFriedRecipe(mainIngredient, supportingIngredients, basics),
        this.createSoupRecipe(mainIngredient, supportingIngredients, basics),
      ],
    };
  }

  private createCurryRecipe(
    mainIngredient: string,
    supportingIngredients: string[],
    basics: string[],
  ): RecipeSuggestion {
    return {
      id: "home-style-curry",
      title: "အိမ်ချက်ဆီပြန်ဟင်း",
      burmeseTitle: `${mainIngredient} ဆီပြန်ဟင်း`,
      summary:
        "ကြက်သွန်နီအခြေခံပြီး နနွင်းနံ့သင်းသင်းနဲ့ ထမင်းမြိန်စေတဲ့ အိမ်ချက်ဟင်းပါ။",
      cookTimeMinutes: 35,
      difficulty: "Easy",
      matchingIngredients: [mainIngredient, ...supportingIngredients],
      missingIngredients: basics,
      steps: [
        "ကြက်သွန်နီ၊ ကြက်သွန်ဖြူနဲ့ ရှိတဲ့ဟင်းသီးဟင်းရွက်တွေကို ပါးပါးလှီးပါ။",
        "ဆီနည်းနည်းနဲ့ ကြက်သွန်နီ၊ နနွင်း၊ ဆားကို နူးအောင်ဆီသတ်ပါ။",
        `${mainIngredient} ထည့်ပြီး အပြင်ပိုင်းအရောင်ပြောင်းလာတဲ့အထိ မွှေပါ။`,
        "ရေနည်းနည်းထည့်ပြီး အဖုံးအုပ်ကာ နူးတဲ့အထိ တည်ပါ။",
        "အရသာညှိပြီး ငရုတ်သီး သို့မဟုတ် နံနံပင် ရှိရင် အပေါ်က ဖြူးပါ။",
      ],
      tips: [
        "ရေနည်းနည်းနဲ့တည်ရင် ဟင်းရည်ပိုစေးပြီး ထမင်းမြိန်ပါတယ်။",
        "ချဉ်ပေါင်ဟင်းချို သို့မဟုတ် အချဉ်သုပ်တစ်ခုနဲ့ တွဲစားလို့ကောင်းပါတယ်။",
      ],
    };
  }

  private createFriedRecipe(
    mainIngredient: string,
    supportingIngredients: string[],
    basics: string[],
  ): RecipeSuggestion {
    return {
      id: "quick-fried-rice",
      title: "မြန်မြန်ကြော်စားလို့ရတဲ့ ထမင်းကြော်",
      burmeseTitle: `${mainIngredient} ထမင်းကြော်`,
      summary:
        "ထမင်းကျန်ရှိရင် အိုးတစ်လုံးတည်းနဲ့ အချိန်တိုအတွင်း ပြီးနိုင်တဲ့ မိသားစုစားဟင်းပါ။",
      cookTimeMinutes: 20,
      difficulty: "Easy",
      matchingIngredients: [mainIngredient, ...supportingIngredients],
      missingIngredients: ["ထမင်းကျန်", ...basics.slice(0, 2)],
      steps: [
        "ပါဝင်ပစ္စည်းတွေကို သေးသေးလှီးထားပါ။",
        `${mainIngredient} ကို ဆီနည်းနည်းနဲ့ ကြက်သွန်ဖြူနံ့ထွက်အောင် ကြော်ပါ။`,
        "ဟင်းသီးဟင်းရွက် သို့မဟုတ် ကြက်သွန်နီထည့်ပြီး ခဏကြော်ပါ။",
        "ထမင်းထည့်ပြီး ဆား၊ ပဲငံပြာရည် ရှိရင် နည်းနည်းထည့်ကာ သမအောင်ကြော်ပါ။",
        "စားခါနီး ငရုတ်သီးမှုန့် သို့မဟုတ် သံပရာရည်နည်းနည်းနဲ့ အရသာညှိပါ။",
      ],
      tips: [
        "အအေးခံထားတဲ့ ထမင်းနဲ့ကြော်ရင် မကပ်ဘဲ ပိုကောင်းပါတယ်။",
        "ကြက်ဥတစ်လုံးထည့်ရင် ပိုပြည့်စုံတဲ့ဟင်းဖြစ်ပါတယ်။",
      ],
    };
  }

  private createSoupRecipe(
    mainIngredient: string,
    supportingIngredients: string[],
    basics: string[],
  ): RecipeSuggestion {
    return {
      id: "clear-soup",
      title: "ထမင်းစားဝိုင်းကို ပေါ့ပါးစေတဲ့ ဟင်းချို",
      burmeseTitle: `${mainIngredient} ဟင်းချို`,
      summary:
        "ဆီပြန်ဟင်းနဲ့တွဲစားလို့ကောင်းပြီး စားပွဲကို ပိုပြည့်စုံစေတဲ့ ပေါ့ပေါ့ပါးပါး ဟင်းချိုပါ။",
      cookTimeMinutes: 25,
      difficulty: "Easy",
      matchingIngredients: [mainIngredient, ...supportingIngredients],
      missingIngredients: basics.slice(0, 2),
      steps: [
        "ရေကို ကြက်သွန်ဖြူ၊ ဆားနဲ့ နနွင်းနည်းနည်းထည့်ပြီး ဆူအောင်တည်ပါ။",
        `${mainIngredient} ထည့်ပြီး မီးအေးအေးနဲ့ တည်ပါ။`,
        "နူးလွယ်တဲ့ဟင်းသီးဟင်းရွက်တွေကို နောက်ဆုံးပိုင်းမှ ထည့်ပါ။",
        "ဟင်းရည်အရသာကို စမ်းပြီး ဆားညှိပါ။",
        "ပူပူနွေးနွေး ထမင်းနဲ့ တွဲစားပါ။",
      ],
      tips: [
        "ငရုတ်ကောင်းနည်းနည်းထည့်ရင် ဟင်းချိုနံ့ ပိုကောင်းပါတယ်။",
        "သံပရာရည်နည်းနည်းညှစ်ရင် အရသာပိုလန်းပါတယ်။",
      ],
    };
  }
}
